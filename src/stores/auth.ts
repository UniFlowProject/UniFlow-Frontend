import { env } from '@/env'
import { buildCognitoAuthorizeUrl, buildCognitoLogoutUrl, decodeJwt, exchangeCognitoCode, refreshCognitoTokens, type CognitoTokens } from '@/lib/cognito'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
}

// Configuración de OAuth providers
const OAUTH_CONFIG: Record<"google", ProviderConfig> = {
  google: {
    clientId: env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: env.VITE_GOOGLE_CLIENT_SECRET,
    redirectUri: `${window.location.origin}/auth/callback`,
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: env.VITE_ACADEMIC_SERVICE_URL + '/auth/google/callback',
    // tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: env.VITE_ACADEMIC_SERVICE_URL + '/students/me'
  }
}

interface AuthState {
  // Estado
  authToken: string | null
  refreshToken: string | null
  tokenExpiresAt: number | null
  userInfo: any | null
  provider: 'google' | 'cognito' | null
  loading: boolean
  error: string | null

  // Getters computados
  isAuthenticated: () => boolean
  // Funciones
  loginWithProvider: (provider: 'google' | 'cognito') => Promise<void>
  getValidAccessToken: () => Promise<string | null>
  exchangeCodeForToken: (provider: 'google', code: string, config: ProviderConfig) => Promise<any>
  getUserInfo: (provider: 'google', accessToken: string, config: any) => Promise<any>
  handleOAuthCallback: () => Promise<boolean>
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<any>
  logout: () => Promise<void>
  clearError: () => void
  refreshUserInfo: () => Promise<void>
}

// Sesión derivada de los tokens de Cognito; userInfo sale de los claims del idToken
const cognitoSession = (tokens: CognitoTokens) => {
  const claims = decodeJwt(tokens.idToken)

  return {
    authToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? null,
    tokenExpiresAt: tokens.expiresAt,
    provider: 'cognito' as const,
    userInfo: { ...claims, id: claims.sub },
  }
}

// Zustand store para autenticación
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado
      authToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      userInfo: null,
      provider: null,
      loading: false,
      error: null,

      // Getters computados
      isAuthenticated: () => !!get().authToken,

      // Función para iniciar login con un provider
      loginWithProvider: async (providerName) => {
        if (providerName === 'cognito') {
          try {
            window.location.href = await buildCognitoAuthorizeUrl()
          } catch (error: unknown) {
            set({ error: `Error iniciando login: ${error instanceof Error ? error.message : 'Unknown error'}` })
          }
          return
        }

        const config = OAUTH_CONFIG[providerName]
        if (!config) {
          set({ error: 'Provider no configurado' })
          return
        }

        try {
          // Generar state único para CSRF protection
          const state = `${providerName}:${Math.random().toString(36).substring(2)}`
          sessionStorage.setItem('oauth_state', state)

          const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,
            state,
            ...(providerName === 'google' && {
              response_type: 'code',
              access_type: 'offline',
              prompt: 'consent'
            })
          })

          const authUrl = `${config.authUrl}?${params.toString()}`
          window.location.href = authUrl
        } catch (error: unknown) {
          set({ error: `Error iniciando login: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      // Intercambiar código por token
      exchangeCodeForToken: async (providerName, code, config) => {
        let body: BodyInit;
        if (providerName === "google") {
          body = JSON.stringify({ code, redirectUri: config.redirectUri })
          // const params = new URLSearchParams({
          //   client_id: config.clientId,
          //   client_secret: config.clientSecret,
          //   code,
          //   redirect_uri: config.redirectUri,
          //   grant_type: 'authorization_code'
          // });
          // body = params;
        } else {
          body = JSON.stringify({ code });
        }

        const requestInit: RequestInit = providerName === 'google' ? {
          method: 'POST',
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': env.VITE_APIM_TOKEN,
          },
          body
        } : {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': env.VITE_APIM_TOKEN,
          },
          body
        }

        console.log("Request Init:", requestInit);
        const response = await fetch(config.tokenUrl, requestInit)

        if (!response.ok) {
          throw new Error(`Error intercambiando código: ${response.status}`)
        }

        const data = await response.json()

        // if (!data.access_token) {
        if (!data.access_token) {
          throw new Error('No se recibió access_token')
        }

        return data
      },

      // Obtener información del usuario
      getUserInfo: async (providerName, accessToken, config) => {
        if (providerName !== 'google') {
          throw new Error('Provider no soportado para obtener info de usuario')
        }

        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': env.VITE_APIM_TOKEN,
        } as any

        const response = await fetch(config.userInfoUrl, { headers })

        if (!response.ok) {
          throw new Error(`Error obteniendo info del usuario: ${response.status}`)
        }

        const userData = await response.json()

        return userData
      },

      // Manejar callback de OAuth
      handleOAuthCallback: async () => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        console.log('state', state?.split(':'))

        if (!code || !state) return false

        set({ loading: true, error: null })

        try {
          // Verificar state CSRF
          const savedState = sessionStorage.getItem('oauth_state')
          if (state !== savedState) {
            throw new Error('State mismatch - posible ataque CSRF')
          }

          // Extraer provider del state
          const currentProvider = state.split(':')[0] as 'google' | 'cognito'

          if (currentProvider === 'cognito') {
            const tokens = await exchangeCognitoCode(code)
            set({ ...cognitoSession(tokens), loading: false, error: null })

            sessionStorage.removeItem('oauth_state')
            sessionStorage.removeItem('pkce_verifier')
            window.history.replaceState({}, document.title, window.location.pathname)
            return true
          }

          const config = OAUTH_CONFIG[currentProvider]

          console.log('Current Provider:', currentProvider)

          if (!config) {
            throw new Error('Provider no válido')
          }

          // Intercambiar código por token
          const tokenData = await get().exchangeCodeForToken(currentProvider, code, config)

          // Obtener información del usuario
          const userData = await get().getUserInfo(currentProvider, tokenData.access_token, config)

          // Actualizar estado
          set({
            authToken: tokenData.access_token,
            userInfo: userData,
            provider: currentProvider,
            loading: false,
            error: null
          })

          // Limpiar storage temporal
          sessionStorage.removeItem('oauth_state')

          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname)

          return true

        } catch (error: unknown) {
          console.error('Error en callback OAuth:', error)
          set({
            loading: false,
            error: `Error al obtener token: ${error instanceof Error ? error.message : 'Error desconocido'}`
          })
          return false
        }
      },

      // Función para hacer requests autenticados
      makeAuthenticatedRequest: async (url, options = {}) => {
        const { authToken, provider } = get()

        if (!authToken) {
          throw new Error('No hay token de autenticación disponible')
        }

        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'X-Auth-Provider': provider || 'unknown',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new Error(`Error en request: ${response.status}`)
        }

        return response.json()
      },

      // Función para logout
      logout: async () => {
        try {
        const href = await buildCognitoLogoutUrl()

        set({
          authToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          userInfo: null,
          provider: null,
          error: null
        })
        sessionStorage.removeItem('oauth_state')
          sessionStorage.removeItem('pkce_verifier')
          window.location.href = href
        } catch (error) {
          console.error('Error al cerrar sesión:', error)
        }
      },

      // Devuelve el access token, refrescándolo si está por expirar (Cognito)
      getValidAccessToken: async () => {
        const { authToken, provider, refreshToken, tokenExpiresAt } = get()

        if (provider !== 'cognito' || !tokenExpiresAt || tokenExpiresAt - Date.now() > 60_000) {
          return authToken
        }

        if (!refreshToken) {
          get().logout()
          return null
        }

        try {
          set(cognitoSession(await refreshCognitoTokens(refreshToken)))
          return get().authToken
        } catch (error) {
          console.error('Error refrescando sesión de Cognito:', error)
          get().logout()
          return null
        }
      },

      // Limpiar errores
      clearError: () => set({ error: null }),

      // Función para refrescar datos del usuario
      refreshUserInfo: async () => {
        const { authToken, provider } = get()

        if (!authToken || provider !== 'google') return

        set({ loading: true })

        try {
          const config = OAUTH_CONFIG[provider]
          const userData = await get().getUserInfo(provider, authToken, config)
          set({ userInfo: userData, loading: false })
        } catch (error) {
          console.error('Error refrescando datos:', error)
          set({ loading: false, error: 'Error al refrescar datos del usuario' })
        }
      }
    }),
    {
      name: 'auth-storage',
      // Solo persistir datos seguros (no el error ni loading)
      partialize: (state) => ({
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        userInfo: state.userInfo,
        provider: state.provider
      })
    }
  )
)

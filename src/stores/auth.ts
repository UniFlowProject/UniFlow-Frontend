import { buildCognitoAuthorizeUrl, buildCognitoLogoutUrl, decodeJwt, exchangeCognitoCode, refreshCognitoTokens, type CognitoTokens } from '@/lib/cognito'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  // Estado
  authToken: string | null
  refreshToken: string | null
  tokenExpiresAt: number | null
  userInfo: any | null
  provider: 'cognito' | null
  loading: boolean
  error: string | null

  // Getters computados
  isAuthenticated: () => boolean
  // Funciones
  loginWithProvider: (provider: 'cognito') => Promise<void>
  getValidAccessToken: () => Promise<string | null>
  handleOAuthCallback: () => Promise<boolean>
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<any>
  logout: () => Promise<void>
  clearError: () => void
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
      loginWithProvider: async () => {
        try {
          window.location.href = await buildCognitoAuthorizeUrl()
        } catch (error: unknown) {
          set({ error: `Error iniciando login: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
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

          const tokens = await exchangeCognitoCode(code)
          set({ ...cognitoSession(tokens), loading: false, error: null })

          sessionStorage.removeItem('oauth_state')
          sessionStorage.removeItem('pkce_verifier')
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

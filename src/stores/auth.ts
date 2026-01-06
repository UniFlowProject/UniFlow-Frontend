import { env } from '@/env'
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
    tokenUrl: env.VITE_ACADEMIC_SERVICE_URL + '/v1/auth/google/callback',
    // tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: env.VITE_ACADEMIC_SERVICE_URL + '/v1/students/me'
  }
}

interface AuthState {
  // Estado
  authToken: string | null
  userInfo: any | null
  loading: boolean
  error: string | null

  // Getters computados
  isAuthenticated: () => boolean
  // Funciones
  loginWithGoogle: () => Promise<void>
  exchangeCodeForToken: (code: string, config: ProviderConfig) => Promise<any>
  getUserInfo: (accessToken: string, config: any) => Promise<any>
  handleOAuthCallback: () => Promise<boolean>
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<any>
  logout: () => void
  clearError: () => void
  refreshUserInfo: () => Promise<void>
}

// Zustand store para autenticación
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado
      authToken: null,
      userInfo: null,
      loading: false,
      error: null,

      // Getters computados
      isAuthenticated: () => !!get().authToken,
      loginWithGoogle: async () => {
        const config = OAUTH_CONFIG['google']

        try {
          // Generar state único para CSRF protection
          const state = `google:${Math.random().toString(36).substring(2)}`
          sessionStorage.setItem('oauth_state', state)

          const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,
            state,
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent'
          })

          const authUrl = `${config.authUrl}?${params.toString()}`
          window.location.href = authUrl
        } catch (error: unknown) {
          set({ error: `Error iniciando login: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      // Intercambiar código por token
      exchangeCodeForToken: async (code, config) => {
        let body: BodyInit = JSON.stringify({ code, redirectUri: config.redirectUri });

        const requestInit: RequestInit = {
          method: 'POST',
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': env.VITE_APIM_TOKEN,
          },
          body
        }

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
      getUserInfo: async (accessToken, config) => {
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

        if (!code || !state) return false

        set({ loading: true, error: null })

        try {
          // Verificar state CSRF
          const savedState = sessionStorage.getItem('oauth_state')
          if (state !== savedState) {
            throw new Error('State mismatch - posible ataque CSRF')
          }

          // set({
          //   authToken: "1a2b3c4d5e6f7g8h9i0j", // Simulado
          //   userInfo: {
          //     id: "test-user-123",
          //     name: "Usuario de Prueba",
          //     email: "usuario@prueba.com"

          //   },
          //   loading: false,
          //   error: null
          // })

          // return true;

          // Extraer provider del state
          const config = OAUTH_CONFIG["google"]

          // Intercambiar código por token
          const tokenData = await get().exchangeCodeForToken(code, config)

          // Obtener información del usuario
          const userData = await get().getUserInfo(tokenData.access_token, config)

          // Actualizar estado
          set({
            authToken: tokenData.access_token,
            userInfo: userData,
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
        const { authToken } = get()

        if (!authToken) {
          throw new Error('No hay token de autenticación disponible')
        }

        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'X-Auth-Provider': 'google',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new Error(`Error en request: ${response.status}`)
        }

        return response.json()
      },

      // Función para logout
      logout: () => {
        set({
          authToken: null,
          userInfo: null,
          error: null
        })
        sessionStorage.removeItem('oauth_state')
      },

      // Limpiar errores
      clearError: () => set({ error: null }),

      // Función para refrescar datos del usuario
      refreshUserInfo: async () => {
        const { authToken } = get()

        if (!authToken) return

        set({ loading: true })

        try {
          const config = OAUTH_CONFIG["google"]
          const userData = await get().getUserInfo(authToken, config)
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
        userInfo: state.userInfo,
      })
    }
  )
)

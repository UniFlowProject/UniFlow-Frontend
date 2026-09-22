import { env } from '@/env'

// Cognito Hosted UI + Authorization Code flow with PKCE (public client, no secret)
const DOMAIN = env.VITE_COGNITO_DOMAIN.replace(/\/$/, '')
const REDIRECT_URI = `${window.location.origin}/auth/callback`

export interface CognitoTokens {
  accessToken: string
  idToken: string
  refreshToken?: string
  expiresAt: number
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const randomString = (size: number) => base64Url(crypto.getRandomValues(new Uint8Array(size)))

const sha256 = async (value: string) =>
  base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))))

export const decodeJwt = (token: string): Record<string, any> => {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(decodeURIComponent(escape(atob(payload))))
}

export const buildCognitoAuthorizeUrl = async () => {
  const verifier = randomString(48)
  const state = `cognito:${randomString(16)}`
  sessionStorage.setItem('oauth_state', state)
  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid email profile',
    state,
    code_challenge_method: 'S256',
    code_challenge: await sha256(verifier),
  })

  return `${DOMAIN}/oauth2/authorize?${params}`
}

export const buildCognitoLogoutUrl = async () => {
  const params = new URLSearchParams({
    client_id: env.VITE_COGNITO_CLIENT_ID,
    logout_uri: window.location.origin,
  })

  return `${DOMAIN}/logout?${params}`
}

const requestTokens = async (body: Record<string, string>, previousRefreshToken?: string): Promise<CognitoTokens> => {
  const response = await fetch(`${DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.VITE_COGNITO_CLIENT_ID, ...body }),
  })

  if (!response.ok) {
    throw new Error(`Cognito token error: ${response.status}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    // El grant refresh_token no devuelve un refresh token nuevo
    refreshToken: data.refresh_token ?? previousRefreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

export const exchangeCognitoCode = (code: string) => {
  const verifier = sessionStorage.getItem('pkce_verifier')
  if (!verifier) throw new Error('Falta el code_verifier de PKCE')

  return requestTokens({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  })
}

export const refreshCognitoTokens = (refreshToken: string) =>
  requestTokens({ grant_type: 'refresh_token', refresh_token: refreshToken }, refreshToken)

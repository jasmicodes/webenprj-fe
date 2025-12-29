const TOKEN_KEY = 'token'
let inMemoryToken: string | null = null

export const getToken = () => {
  if (inMemoryToken) return inMemoryToken
  const stored = sessionStorage.getItem(TOKEN_KEY)
  inMemoryToken = stored
  return stored
}

export const setToken = (token: string) => {
  inMemoryToken = token
  sessionStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  inMemoryToken = null
  sessionStorage.removeItem(TOKEN_KEY)
}

type JwtPayload = {
  exp?: number
}

// Decodes JWT for client-side use only (expiry check). Signature is verified server-side.
function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  const payloadPart = parts[1]
  if (parts.length !== 3 || !payloadPart) return null
  try {
    const payload = JSON.parse(atob(payloadPart))
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, clockSkewSeconds = 30): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp < nowSeconds + clockSkewSeconds
}

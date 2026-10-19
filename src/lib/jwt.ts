/**
 * Minimal JWT reader.
 *
 * The token is decoded for display and expiry only — authorization decisions
 * always come from the server. Nothing here is trusted for access control.
 */

export interface JwtClaims {
  sub?: string
  tenantId?: string
  role?: string
  iat?: number
  exp?: number
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return atob(normalized + padding)
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(base64UrlDecode(payload)) as JwtClaims
  } catch {
    return null
  }
}

/** Epoch milliseconds at which the token expires, or 0 when unknown. */
export function getExpiryMillis(token: string): number {
  const claims = decodeJwt(token)
  return claims?.exp ? claims.exp * 1000 : 0
}

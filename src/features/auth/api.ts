import { apiFetch } from '../../lib/api'
import type { LoginResponse } from '../../types'

/** Exchanges credentials for a JWT. Returns 401 for any invalid input. */
export function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { username, password },
  })
}

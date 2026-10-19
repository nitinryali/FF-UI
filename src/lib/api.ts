import { useSessionStore } from '../features/auth/sessionStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Error carrying the HTTP status and the server's `{"error": "..."}` message. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Sent as `X-Tenant-Id`; required by every `/flags` route. */
  tenantId?: string | null
  /** Attach the bearer token. Defaults to true; login opts out. */
  auth?: boolean
}

/**
 * Single entry point for the API.
 *
 * Injects the bearer token and `X-Tenant-Id`, unwraps the `{ "error": ... }`
 * envelope into an {@link ApiError}, and clears the session on an authenticated
 * `401` so the guards bounce the user to the login screen.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, tenantId, auth = true } = options
  const { session, clear } = useSessionStore.getState()
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    if (!session) throw new ApiError(401, 'Authentication required')
    headers.Authorization = `Bearer ${session.token}`
  }
  if (tenantId) headers['X-Tenant-Id'] = tenantId

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (auth && response.status === 401) {
    clear()
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  // Error bodies are not always JSON (a proxy or gateway may return HTML), so a
  // parse failure must not mask the status.
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : response.status >= 500
          ? `The service is unavailable (${response.status}).`
          : `Request failed (${response.status})`
    throw new ApiError(response.status, message)
  }

  return data as T
}

import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from '../auth/sessionStore'
import { listTenants } from './api'

/**
 * Resolves a tenant id to its display name using the cached tenant list.
 *
 * `GET /tenants` is platform-admin only today, so a tenant user's lookup is
 * expected to come back `403`. The query is still enabled for them — the name
 * shows up as soon as the API permits it — but it neither retries nor surfaces
 * an error, and callers fall back to the id while `null` is returned.
 */
export function useTenantName(tenantId: string | null): string | null {
  const isAdmin = useSessionStore((state) => state.session?.role === 'PLATFORM_ADMIN')

  const { data } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
    enabled: tenantId !== null,
    retry: isAdmin ? 1 : false,
  })

  if (!tenantId || !data) return null
  return data.find((tenant) => tenant.id === tenantId)?.name ?? null
}

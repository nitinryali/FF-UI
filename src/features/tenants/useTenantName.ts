import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from '../auth/sessionStore'
import { listTenants } from './api'

/**
 * Resolves a tenant id to its display name using the cached tenant list.
 *
 * `GET /tenants` is platform-admin only, so tenant users fall back to `null`
 * and callers should render the id instead.
 */
export function useTenantName(tenantId: string | null): string | null {
  const isAdmin = useSessionStore((state) => state.session?.role === 'PLATFORM_ADMIN')

  const { data } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
    enabled: isAdmin,
  })

  if (!tenantId || !data) return null
  return data.find((tenant) => tenant.id === tenantId)?.name ?? null
}

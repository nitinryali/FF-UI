import { useSessionStore } from './sessionStore'

/**
 * The tenant every `/flags` request must be scoped to.
 *
 * - Tenant users: always their own tenant.
 * - Platform admins: the tenant they selected, or `null` until they pick one.
 */
export function useEffectiveTenantId(): string | null {
  return useSessionStore((state) => {
    if (!state.session) return null
    return state.session.role === 'PLATFORM_ADMIN'
      ? state.selectedTenantId
      : state.session.tenantId
  })
}

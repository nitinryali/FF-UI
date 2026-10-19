import { useQuery } from '@tanstack/react-query'
import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffectiveTenantId } from '../../features/auth/useEffectiveTenantId'
import { useSessionStore } from '../../features/auth/sessionStore'
import { listTenants } from '../../features/tenants/api'
import { useTenantName } from '../../features/tenants/useTenantName'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Select } from '../ui/Input'

/**
 * Top bar: identity, role, and tenant context.
 *
 * Platform admins get a tenant selector; tenant users see a fixed badge for
 * their own tenant. The selected tenant scopes every future `/flags` request.
 */
export function TopBar({ onToggleNav }: { onToggleNav: () => void }) {
  const navigate = useNavigate()
  const session = useSessionStore((state) => state.session)
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId)
  const setSelectedTenantId = useSessionStore((state) => state.setSelectedTenantId)
  const clear = useSessionStore((state) => state.clear)
  const effectiveTenantId = useEffectiveTenantId()

  const isAdmin = session?.role === 'PLATFORM_ADMIN'
  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
    enabled: isAdmin,
  })
  // Admins read names from the selector above; tenant users resolve their own.
  const tenantName = useTenantName(isAdmin ? null : effectiveTenantId)

  const handleLogout = () => {
    clear()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 shrink-0 p-0 md:hidden"
          onClick={onToggleNav}
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        {isAdmin ? (
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:flex-none">
            <span className="hidden shrink-0 text-slate-500 sm:inline">Tenant</span>
            <Select
              aria-label="Selected tenant"
              value={selectedTenantId ?? ''}
              onChange={(event) => setSelectedTenantId(event.target.value || null)}
              className="h-9 w-full min-w-0 sm:w-56"
              disabled={tenantsQuery.isLoading}
            >
              <option value="">
                {tenantsQuery.isLoading ? 'Loading tenants…' : 'Select a tenant…'}
              </option>
              {(tenantsQuery.data ?? []).map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </Select>
          </label>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:flex-none">
            <span className="hidden shrink-0 text-slate-500 sm:inline">Tenant</span>
            <Badge tone="brand" className="max-w-full truncate" title={effectiveTenantId ?? undefined}>
              {tenantName ?? effectiveTenantId ?? '—'}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Badge tone={isAdmin ? 'brand' : 'neutral'}>
          {isAdmin ? (
            <>
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Platform admin</span>
            </>
          ) : (
            <>
              <span className="sm:hidden">Tenant</span>
              <span className="hidden sm:inline">Tenant user</span>
            </>
          )}
        </Badge>
        <span className="hidden text-sm text-slate-600 sm:inline">{session?.username}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  )
}

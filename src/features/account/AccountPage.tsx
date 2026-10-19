import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDateTime } from '../../lib/format'
import { useEffectiveTenantId } from '../auth/useEffectiveTenantId'
import { useSessionStore } from '../auth/sessionStore'
import { useTenantName } from '../tenants/useTenantName'

export function AccountPage() {
  const navigate = useNavigate()
  const session = useSessionStore((state) => state.session)
  const clear = useSessionStore((state) => state.clear)
  const effectiveTenantId = useEffectiveTenantId()
  const isAdmin = session?.role === 'PLATFORM_ADMIN'
  const homeTenantName = useTenantName(session?.tenantId ?? null)
  const selectedTenantName = useTenantName(isAdmin ? effectiveTenantId : null)

  if (!session) return null

  const handleLogout = () => {
    clear()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <PageHeader title="Account" description="Your session details." />

      <Card className="max-w-lg divide-y divide-slate-100">
        <Row label="Username" value={session.username} />
        <Row
          label="Role"
          value={<Badge tone={isAdmin ? 'brand' : 'neutral'}>{isAdmin ? 'Platform admin' : 'Tenant user'}</Badge>}
        />
        <Row
          label="Home tenant"
          value={
            <span className="flex flex-wrap items-center justify-end gap-2">
              {homeTenantName ? <span>{homeTenantName}</span> : null}
              <span className="break-all font-mono text-xs text-slate-500">{session.tenantId}</span>
            </span>
          }
        />
        {isAdmin ? (
          <Row
            label="Selected tenant"
            value={
              effectiveTenantId ? (
                <span className="flex flex-wrap items-center justify-end gap-2">
                  {selectedTenantName ? <span>{selectedTenantName}</span> : null}
                  <span className="break-all font-mono text-xs text-slate-500">{effectiveTenantId}</span>
                </span>
              ) : (
                <span className="text-slate-500">None selected</span>
              )
            }
          />
        ) : null}
        <Row
          label="Token expires"
          value={session.expiresAt ? formatDateTime(new Date(session.expiresAt).toISOString()) : 'Unknown'}
        />
        <div className="p-4">
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

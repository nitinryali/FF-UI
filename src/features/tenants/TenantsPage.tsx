import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CopyButton } from '../../components/ui/CopyButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { toast } from '../../lib/toastStore'
import type { Tenant } from '../../types'
import { useSessionStore } from '../auth/sessionStore'
import { CreateTenantDialog } from './CreateTenantDialog'
import { deleteTenant, listTenants } from './api'

export function TenantsPage() {
  const queryClient = useQueryClient()
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId)
  const setSelectedTenantId = useSessionStore((state) => state.setSelectedTenantId)
  const [createOpen, setCreateOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)

  const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listTenants })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: async (_result, id) => {
      // Drop the selection if the tenant we were looking at just disappeared.
      if (selectedTenantId === id) setSelectedTenantId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({ queryKey: ['flags'] }),
      ])
      toast.success('Tenant deleted')
      setTenantToDelete(null)
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete the tenant.')
    },
  })

  const tenants = tenantsQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Each tenant isolates one customer's flags and users."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => void tenantsQuery.refetch()}
              disabled={tenantsQuery.isFetching}
            >
              {tenantsQuery.isFetching ? (
                <Spinner />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Refresh
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New tenant
            </Button>
          </>
        }
      />

      {tenantsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner />
          Loading tenants…
        </div>
      ) : tenantsQuery.isError ? (
        <Alert tone="danger">
          {tenantsQuery.error instanceof ApiError
            ? tenantsQuery.error.message
            : 'Could not load tenants.'}
        </Alert>
      ) : tenants.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Create a tenant before adding flags or users."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New tenant
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium sm:px-4">Name</th>
                  <th className="px-3 py-3 font-medium sm:px-4">Selected</th>
                  {/* Created and Id are desktop-only; the date rides along under the name on phones. */}
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Created</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Id</th>
                  <th className="px-3 py-3 font-medium sm:px-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-900 sm:px-4">
                      {tenant.name}
                      <span className="mt-0.5 block text-xs font-normal text-slate-500 sm:hidden">
                        {formatDateTime(tenant.createdAt)}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {selectedTenantId === tenant.id ? (
                        <Badge tone="brand">Active</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTenantId(tenant.id)}
                        >
                          Select
                        </Button>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 sm:table-cell">
                      {formatDateTime(tenant.createdAt)}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <CopyButton value={tenant.id} label="Copy id" />
                    </td>
                    <td className="px-3 py-3 text-right sm:px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${tenant.name}`}
                        onClick={() => setTenantToDelete(tenant)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateTenantDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={tenantToDelete !== null}
        onClose={() => setTenantToDelete(null)}
        onConfirm={() => {
          if (tenantToDelete) deleteMutation.mutate(tenantToDelete.id)
        }}
        title="Delete tenant"
        description={
          tenantToDelete
            ? `This permanently deletes "${tenantToDelete.name}", all of its flags, and all of its users. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete tenant"
        confirmPhrase={tenantToDelete?.name}
        phraseLabel="Type the tenant name to confirm:"
        pending={deleteMutation.isPending}
      />
    </>
  )
}

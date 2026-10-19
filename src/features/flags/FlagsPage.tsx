import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CopyButton } from '../../components/ui/CopyButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Toggle } from '../../components/ui/Toggle'
import { ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { toast } from '../../lib/toastStore'
import type { Flag } from '../../types'
import { useEffectiveTenantId } from '../auth/useEffectiveTenantId'
import { useTenantName } from '../tenants/useTenantName'
import { CreateFlagDialog } from './CreateFlagDialog'
import { deleteFlag, listFlags, updateFlagValue } from './api'

type ValueFilter = 'all' | 'enabled' | 'disabled'

export function FlagsPage() {
  const tenantId = useEffectiveTenantId()

  if (!tenantId) {
    return (
      <>
        <PageHeader title="Flags" description="Feature flags for the selected tenant." />
        <EmptyState
          title="Select a tenant"
          description="Platform admins manage flags one tenant at a time. Choose a tenant in the top bar to continue."
        />
      </>
    )
  }

  return <FlagsView tenantId={tenantId} />
}

function FlagsView({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient()
  const tenantName = useTenantName(tenantId)
  const tenantLabel = tenantName ?? tenantId
  const [search, setSearch] = useState('')
  const [valueFilter, setValueFilter] = useState<ValueFilter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [flagToDelete, setFlagToDelete] = useState<Flag | null>(null)

  const flagsQuery = useQuery({
    queryKey: ['flags', tenantId],
    queryFn: () => listFlags(tenantId),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      updateFlagValue(tenantId, id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: ['flags', tenantId] })
      const previous = queryClient.getQueryData<Flag[]>(['flags', tenantId])
      queryClient.setQueryData<Flag[]>(['flags', tenantId], (old) =>
        old?.map((flag) => (flag.id === id ? { ...flag, value } : flag)),
      )
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['flags', tenantId], context.previous)
      }
      toast.error(error instanceof ApiError ? error.message : 'Could not update the flag.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['flags', tenantId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlag(tenantId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['flags', tenantId] })
      toast.success('Flag deleted')
      setFlagToDelete(null)
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete the flag.')
    },
  })

  const flags = useMemo(() => flagsQuery.data ?? [], [flagsQuery.data])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return flags.filter((flag) => {
      if (needle && !flag.name.toLowerCase().includes(needle)) return false
      if (valueFilter === 'enabled' && !flag.value) return false
      if (valueFilter === 'disabled' && flag.value) return false
      return true
    })
  }, [flags, search, valueFilter])

  return (
    <>
      <PageHeader
        title="Flags"
        description={`Feature flags for tenant "${tenantLabel}".`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void flagsQuery.refetch()}
              disabled={flagsQuery.isFetching}
            >
              {flagsQuery.isFetching ? (
                <Spinner />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New flag
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search flags…"
            aria-label="Search flags"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter by value"
          value={valueFilter}
          onChange={(event) => setValueFilter(event.target.value as ValueFilter)}
          className="w-40"
        >
          <option value="all">All values</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </Select>
      </div>

      {flagsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner />
          Loading flags…
        </div>
      ) : flagsQuery.isError ? (
        <Alert tone="danger">
          {flagsQuery.error instanceof ApiError ? flagsQuery.error.message : 'Could not load flags.'}
        </Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={flags.length === 0 ? 'No flags yet' : 'No matching flags'}
          description={
            flags.length === 0
              ? 'Create the first flag for this tenant.'
              : 'Adjust the search or value filter.'
          }
          action={
            flags.length === 0 ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New flag
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Id</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((flag) => {
                  const toggling =
                    toggleMutation.isPending && toggleMutation.variables?.id === flag.id
                  return (
                    <tr key={flag.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{flag.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={flag.value}
                            disabled={toggling}
                            label={`Toggle ${flag.name}`}
                            onChange={(next) =>
                              toggleMutation.mutate({ id: flag.id, value: next })
                            }
                          />
                          <span className="text-xs text-slate-600">
                            {flag.value ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{flag.version}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDateTime(flag.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <CopyButton value={flag.id} label="Copy id" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${flag.name}`}
                          onClick={() => setFlagToDelete(flag)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateFlagDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        tenantId={tenantId}
        tenantLabel={tenantLabel}
      />

      <ConfirmDialog
        open={flagToDelete !== null}
        onClose={() => setFlagToDelete(null)}
        onConfirm={() => {
          if (flagToDelete) deleteMutation.mutate(flagToDelete.id)
        }}
        title="Delete flag"
        description={
          flagToDelete
            ? `"${flagToDelete.name}" will be removed from tenant "${tenantLabel}".`
            : undefined
        }
        confirmLabel="Delete flag"
        pending={deleteMutation.isPending}
      />
    </>
  )
}

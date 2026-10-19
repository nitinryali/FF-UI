import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '../../components/layout/PageHeader'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Input, Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { ApiError } from '../../lib/api'
import { toast } from '../../lib/toastStore'
import type { User } from '../../types'
import { useSessionStore } from '../auth/sessionStore'
import { listTenants } from '../tenants/api'
import { createUser } from './api'

const schema = z.object({
  username: z.string().min(1, 'Username is required').max(64, 'At most 64 characters'),
  password: z.string().min(1, 'Password is required').max(128, 'At most 128 characters'),
  tenantId: z.string().min(1, 'Choose a tenant'),
  role: z.enum(['TENANT_USER', 'PLATFORM_ADMIN']),
})

type FormValues = z.infer<typeof schema>

export function UsersPage() {
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId)
  const [lastCreated, setLastCreated] = useState<User | null>(null)

  const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listTenants })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      tenantId: selectedTenantId ?? '',
      role: 'TENANT_USER',
    },
  })

  // Keep the tenant field in step with the tenant chosen in the top bar.
  useEffect(() => {
    if (selectedTenantId) setValue('tenantId', selectedTenantId)
  }, [selectedTenantId, setValue])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createUser(values),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await createMutation.mutateAsync(values)
      setLastCreated(user)
      toast.success(`User "${user.username}" created`)
      reset({ username: '', password: '', tenantId: values.tenantId, role: 'TENANT_USER' })
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.message : 'Could not create the user.',
      })
    }
  })

  const tenants = tenantsQuery.data ?? []

  return (
    <>
      <PageHeader title="Users" description="Create tenant-bound accounts for this deployment." />

      <Alert tone="info" className="mb-4">
        Only creation is available today. Listing, editing, and deleting users needs new backend
        endpoints (see the plan, section 10).
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {errors.root ? <Alert tone="danger">{errors.root.message}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username" htmlFor="user-username" error={errors.username?.message}>
                <Input
                  id="user-username"
                  autoComplete="off"
                  aria-invalid={errors.username ? true : undefined}
                  {...register('username')}
                />
              </Field>

              <Field
                label="Password"
                htmlFor="user-password"
                error={errors.password?.message}
                help="Hashed with BCrypt on the server."
              >
                <Input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? true : undefined}
                  {...register('password')}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tenant" htmlFor="user-tenant" error={errors.tenantId?.message}>
                <Select id="user-tenant" {...register('tenantId')}>
                  <option value="">
                    {tenantsQuery.isLoading ? 'Loading tenants…' : 'Choose a tenant…'}
                  </option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Role"
                htmlFor="user-role"
                help="Role is carried in the user's JWT."
              >
                <Select id="user-role" {...register('role')}>
                  <option value="TENANT_USER">Tenant user</option>
                  <option value="PLATFORM_ADMIN">Platform admin</option>
                </Select>
              </Field>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              Create user
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {lastCreated ? (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Just created</h2>
              <dl className="space-y-2 text-sm">
                <SummaryRow label="Username" value={lastCreated.username} />
                <SummaryRow
                  label="Role"
                  value={
                    <Badge tone={lastCreated.role === 'PLATFORM_ADMIN' ? 'brand' : 'neutral'}>
                      {lastCreated.role === 'PLATFORM_ADMIN' ? 'Platform admin' : 'Tenant user'}
                    </Badge>
                  }
                />
                <SummaryRow
                  label="Tenant"
                  value={<span className="font-mono text-xs">{lastCreated.tenantId}</span>}
                />
              </dl>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  )
}

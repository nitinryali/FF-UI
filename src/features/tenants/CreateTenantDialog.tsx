import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { ApiError } from '../../lib/api'
import { toast } from '../../lib/toastStore'
import { createTenant } from './api'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'At most 100 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Use letters, digits, hyphens, and underscores only'),
})

type FormValues = z.infer<typeof schema>

interface CreateTenantDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateTenantDialog({ open, onClose }: CreateTenantDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) reset({ name: '' })
  }, [open, reset])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createTenant(values.name),
    onSuccess: async (tenant) => {
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(`Tenant "${tenant.name}" created`)
      onClose()
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values)
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.message : 'Could not create the tenant.',
      })
    }
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New tenant"
      description="A tenant isolates one customer's flags and users."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-tenant-form" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            Create tenant
          </Button>
        </>
      }
    >
      <form id="create-tenant-form" className="space-y-4" onSubmit={onSubmit} noValidate>
        {errors.root ? <Alert tone="danger">{errors.root.message}</Alert> : null}

        <Field
          label="Name"
          htmlFor="tenant-name"
          error={errors.name?.message}
          help="Used as the tenant's display name and unique key."
        >
          <Input id="tenant-name" autoFocus autoComplete="off" {...register('name')} />
        </Field>
      </form>
    </Modal>
  )
}

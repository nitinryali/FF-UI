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
import { createFlag } from './api'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'At most 100 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Use letters, digits, hyphens, and underscores only'),
  value: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface CreateFlagDialogProps {
  open: boolean
  onClose: () => void
  tenantId: string
  /** Human-readable tenant, used in the dialog copy. */
  tenantLabel: string
}

export function CreateFlagDialog({ open, onClose, tenantId, tenantLabel }: CreateFlagDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', value: false },
  })

  useEffect(() => {
    if (open) reset({ name: '', value: false })
  }, [open, reset])

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createFlag(tenantId, values),
    onSuccess: async (flag) => {
      await queryClient.invalidateQueries({ queryKey: ['flags', tenantId] })
      toast.success(`Flag "${flag.name}" created`)
      onClose()
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values)
    } catch (error) {
      setError('root', {
        message: error instanceof ApiError ? error.message : 'Could not create the flag.',
      })
    }
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New flag"
      description={`Created in tenant "${tenantLabel}".`}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-flag-form" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            Create flag
          </Button>
        </>
      }
    >
      <form id="create-flag-form" className="space-y-4" onSubmit={onSubmit} noValidate>
        {errors.root ? <Alert tone="danger">{errors.root.message}</Alert> : null}

        <Field
          label="Name"
          htmlFor="flag-name"
          error={errors.name?.message}
          help="Letters, digits, hyphens, and underscores. Names are immutable."
        >
          <Input id="flag-name" autoFocus autoComplete="off" {...register('name')} />
        </Field>

        <label className="flex items-center gap-2 py-1 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            {...register('value')}
          />
          Enabled by default
        </label>
      </form>
    </Modal>
  )
}

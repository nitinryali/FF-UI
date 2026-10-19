import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { ApiError } from '../../lib/api'
import { login } from './api'
import { useSessionStore } from './sessionStore'

const schema = z.object({
  username: z.string().min(1, 'Username is required').max(64, 'At most 64 characters'),
  password: z.string().min(1, 'Password is required').max(128, 'At most 128 characters'),
})

type FormValues = z.infer<typeof schema>

interface LocationState {
  from?: string
  expired?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSessionStore((state) => state.session)
  const setSession = useSessionStore((state) => state.setSession)
  const state = (location.state ?? {}) as LocationState

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  if (session) {
    return <Navigate to={state.from ?? '/flags'} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values.username, values.password)
      setSession({
        token: result.token,
        username: values.username,
        tenantId: result.tenantId,
        role: result.role,
      })
      navigate(state.from ?? '/flags', { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to reach the service. Is it running?'
      setError('root', { message })
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-900">Feature Flags</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage feature flags.</p>
        </div>

        {state.expired ? (
          <Alert tone="warning" className="mb-4">
            Your session expired. Please sign in again.
          </Alert>
        ) : null}

        {errors.root ? (
          <Alert tone="danger" className="mb-4">
            {errors.root.message}
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Field label="Username" htmlFor="username" error={errors.username?.message}>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              aria-invalid={errors.username ? true : undefined}
              {...register('username')}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              {...register('password')}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'info' | 'success' | 'warning' | 'danger'

const TONES: Record<Tone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
}

/** Inline message block, announced politely for screen readers. */
export function Alert({
  tone = 'danger',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="alert"
      className={cn('rounded-md border px-3 py-2 text-sm', TONES[tone], className)}
    >
      {children}
    </div>
  )
}

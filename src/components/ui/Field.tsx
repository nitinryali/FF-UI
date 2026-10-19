import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  help?: string
  children: ReactNode
}

/** Label + control + inline validation message. */
export function Field({ label, htmlFor, error, help, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : help ? (
        <p className="text-xs text-slate-500">{help}</p>
      ) : null}
    </div>
  )
}

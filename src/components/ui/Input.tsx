import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const FIELD_CLASSES =
  // `text-base` on touch screens stops iOS Safari from zooming the page when a
  // field is focused; it drops back to `text-sm` once there is a mouse around.
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm md:text-sm ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_CLASSES, className)} {...props} />
}

/**
 * Native `<select>` with the OS chrome removed so the trigger matches `Input`.
 *
 * The chevron comes from `.select-chevron` in `index.css`: a background image
 * keeps the control a real `<select>`, so keyboard handling, mobile pickers, and
 * spread form props (`{...register('field')}`) keep working.
 */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        FIELD_CLASSES,
        'select-chevron cursor-pointer appearance-none rounded-lg pr-9 transition-colors',
        'hover:border-slate-400',
        'focus:ring-2 focus:ring-indigo-500/25',
        className,
      )}
      {...props}
    />
  )
}

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Copies `value` to the clipboard and briefly confirms. */
export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked (e.g. insecure context); stay silent.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800',
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

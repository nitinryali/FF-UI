import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'
import { Spinner } from './Spinner'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel: string
  tone?: 'danger' | 'primary'
  pending?: boolean
  /**
   * When set, the user must type this exact text before confirming. Used for
   * irreversible actions such as deleting a tenant.
   */
  confirmPhrase?: string
  phraseLabel?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  pending = false,
  confirmPhrase,
  phraseLabel = 'Type to confirm',
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  // Clear the confirmation input each time the dialog opens. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTyped('')
  }

  const phraseSatisfied = !confirmPhrase || typed.trim() === confirmPhrase

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={pending || !phraseSatisfied}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </>
      }
    >
      {confirmPhrase ? (
        <div className="space-y-2">
          <label htmlFor="confirm-phrase" className="block text-sm text-slate-700">
            {phraseLabel} <span className="font-mono font-medium">{confirmPhrase}</span>
          </label>
          <Input
            id="confirm-phrase"
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>
      ) : (
        <p className="text-sm text-slate-600">This action cannot be undone.</p>
      )}
    </Modal>
  )
}

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../../types'
import { useSessionStore } from './sessionStore'

/**
 * Client-side convenience gate. Hiding a route here is cosmetic only — the
 * server enforces roles on every request.
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSessionStore((state) => state.session)

  if (!session || session.role !== role) {
    return <Navigate to="/flags" replace />
  }

  return <>{children}</>
}

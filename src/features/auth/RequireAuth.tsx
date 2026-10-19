import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from './sessionStore'

/**
 * Gate for authenticated routes. Redirects to `/login` when there is no
 * session, or when the stored token has passed its `exp`; the intended path is
 * preserved so login can return the user to it.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSessionStore((state) => state.session)
  const clear = useSessionStore((state) => state.clear)
  const location = useLocation()

  // Reading the clock during render is intentional here: the guard must reflect
  // the token's expiry immediately. The effect below then tears the session down.
  // oxlint-disable-next-line react/purity
  const expired = session !== null && session.expiresAt > 0 && session.expiresAt <= Date.now()

  useEffect(() => {
    if (expired) clear()
  }, [expired, clear])

  if (!session || expired) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}`, expired }}
      />
    )
  }

  return <>{children}</>
}

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getExpiryMillis } from '../../lib/jwt'
import type { Role } from '../../types'

export interface Session {
  token: string
  username: string
  /** The signed-in user's own tenant. `"platform"` for platform admins. */
  tenantId: string
  role: Role
  /** Epoch milliseconds, or 0 when the token carries no `exp`. */
  expiresAt: number
}

/** Everything needed to start a session; `expiresAt` is derived from the token. */
export interface NewSession {
  token: string
  username: string
  tenantId: string
  role: Role
}

interface SessionState {
  session: Session | null
  /** Tenant a platform admin has selected; ignored for tenant users. */
  selectedTenantId: string | null
  setSession: (input: NewSession) => void
  clear: () => void
  setSelectedTenantId: (tenantId: string | null) => void
}

/**
 * Auth + tenant context.
 *
 * Persisted to `sessionStorage` (not `localStorage`) so the token dies with the
 * tab. There is no refresh endpoint today, so `expiresAt` is enforced client
 * side and the guards send the user back to login.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      selectedTenantId: null,
      setSession: ({ token, username, tenantId, role }) =>
        set({
          session: { token, username, tenantId, role, expiresAt: getExpiryMillis(token) },
          // Admins pick a tenant themselves; tenant users are pinned to theirs.
          selectedTenantId: role === 'PLATFORM_ADMIN' ? null : tenantId,
        }),
      clear: () => set({ session: null, selectedTenantId: null }),
      setSelectedTenantId: (selectedTenantId) => set({ selectedTenantId }),
    }),
    {
      name: 'ff-ui-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        session: state.session,
        selectedTenantId: state.selectedTenantId,
      }),
    },
  ),
)

import { NavLink } from 'react-router-dom'
import { Building2, Flag, UserCog, Users, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useSessionStore } from '../../features/auth/sessionStore'

interface NavItem {
  to: string
  label: string
  icon: typeof Flag
  adminOnly?: boolean
}

const ITEMS: NavItem[] = [
  { to: '/flags', label: 'Flags', icon: Flag },
  { to: '/tenants', label: 'Tenants', icon: Building2, adminOnly: true },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/account', label: 'Account', icon: UserCog },
]

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const role = useSessionStore((state) => state.session?.role)
  const items = ITEMS.filter((item) => !item.adminOnly || role === 'PLATFORM_ADMIN')

  return (
    <nav className={cn('flex flex-col gap-1 p-3', className)} aria-label="Main">
      <div className="mb-4 flex items-start justify-between gap-2 px-2 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Feature Flags</p>
          <p className="text-xs text-slate-500">Multi-tenant control plane</p>
        </div>
        {/* Only rendered in the drawer, where the sidebar has no top-bar toggle. */}
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="-mr-1 -mt-1 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              // Taller rows on touch screens, back to the denser desktop sizing at md.
              'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition md:py-2',
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/** Persistent chrome: top bar plus a sidebar that collapses to a drawer. */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const closeNav = () => setNavOpen(false)

  // While the drawer is open, close it on Escape and freeze the page behind it.
  useEffect(() => {
    if (!navOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [navOpen])

  return (
    // `h-dvh` follows the mobile browser's collapsing toolbars, unlike `h-full`.
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar onToggleNav={() => setNavOpen((open) => !open)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex" />

        {navOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="animate-fade-in absolute inset-0 bg-slate-900/40"
              onClick={closeNav}
              aria-hidden="true"
            />
            <Sidebar
              className="animate-slide-in absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl"
              onNavigate={closeNav}
            />
          </div>
        ) : null}

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8 md:pt-8 md:pb-[max(2rem,env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

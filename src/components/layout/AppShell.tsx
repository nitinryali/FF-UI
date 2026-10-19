import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/** Persistent chrome: top bar plus a sidebar that collapses to a drawer. */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <TopBar onToggleNav={() => setNavOpen((open) => !open)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex" />

        {navOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
            <Sidebar
              className="absolute left-0 top-0 flex h-full w-64 border-r border-slate-200 bg-white"
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

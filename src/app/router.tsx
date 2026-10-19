import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AccountPage } from '../features/account/AccountPage'
import { LoginPage } from '../features/auth/LoginPage'
import { RequireAuth } from '../features/auth/RequireAuth'
import { RequireRole } from '../features/auth/RequireRole'
import { NotFoundPage } from '../features/common/NotFoundPage'
import { FlagsPage } from '../features/flags/FlagsPage'
import { TenantsPage } from '../features/tenants/TenantsPage'
import { UsersPage } from '../features/users/UsersPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/flags" replace /> },
      { path: 'flags', element: <FlagsPage /> },
      {
        path: 'tenants',
        element: (
          <RequireRole role="PLATFORM_ADMIN">
            <TenantsPage />
          </RequireRole>
        ),
      },
      {
        path: 'users',
        element: (
          <RequireRole role="PLATFORM_ADMIN">
            <UsersPage />
          </RequireRole>
        ),
      },
      { path: 'account', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

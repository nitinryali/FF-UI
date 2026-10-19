# Flag Service UI

React frontend for the FF Project Flag Service — multi-tenant feature flags.

## Overview

A single-page admin UI for managing tenants, users, and feature flags against the
Flag Service API. Built with Vite, React 19, TypeScript, React Router, TanStack
Query, Zustand, React Hook Form + Zod, and Tailwind CSS.

```bash
npm install
npm run dev     # http://localhost:5173 — sign in with admin / admin
```

The dev server proxies `/api` to `https://flag-service.onrender.com`, so requests
stay same-origin. Deploys as a Render static site via `render.yaml`, calling the
API directly at build-configured `VITE_API_BASE_URL`.

## Features

- **Auth** — login against `POST /auth/login`, JWT held in `sessionStorage`, guards
  for authenticated and role-gated routes.
- **Role-aware shell** — `PLATFORM_ADMIN` vs `TENANT_USER` navigation and access.
- **Tenant context** — platform admins pick a tenant from the top bar; tenant users
  are pinned to their own.
- **Flags** — list, search, filter by value, create, optimistic toggle, and delete.
- **Tenants** — list, create, select, and delete, with type-the-name confirmation.
- **Users** — create tenant-bound accounts with a role.
- **Account** — identity, role, tenant, and token expiry.
- Toasts for mutations, inline validation, and loading, empty, and error states
  throughout.
- SPA history routing with a rewrite to `index.html` on Render.

## Limitations

- **Users screen is create-only** — the API has no `GET /users`, `PATCH /users/{id}`,
  or `DELETE /users/{id}`.
- **No server-side pagination or search** for flags and tenants; everything is
  fetched and filtered client-side.
- **No audit trail** — no flag history, undo, or restore for soft-deleted flags.
- **No session refresh** — no refresh-token or API-key flow, so a session simply
  ends when the JWT expires.
- **Missing endpoints** — no `GET /auth/me` or `GET /flags/{id}`.
- **Client-side role checks are cosmetic**; the server enforces access on every call.
- **Tenant users see their tenant id**, not its name, because `GET /tenants` is
  unavailable to them.
- **CORS is required** for the deployed build — the static site calls the API
  cross-origin, so login fails until the API's CORS support is actually deployed.
- **Cold starts** — Render's free tier sleeps when idle; the first request can take
  30–60s.
- **No code splitting** — one bundle of about 509 kB (155 kB gzipped).
- **Flag names are immutable**; only the value changes. Tenant deletion is a hard
  cascade over its flags and users.

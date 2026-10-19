# Flag Service UI

React frontend for the FF Project Flag Service (multi-tenant feature flags).

The full design plan lives in the service repository at `../docs/react-ui-plan.md`.

## Status

Phases 0–2 of the plan are implemented.

**Working today**

- Login against `POST /auth/login`, with the JWT held in `sessionStorage`.
- Role-aware app shell (`PLATFORM_ADMIN` vs `TENANT_USER`).
- Tenant context: platform admins pick a tenant in the top bar; tenant users are pinned to their own.
- **Flags** — list, search, filter by value, create, optimistic toggle, and delete.
- **Tenants** — list, create, select, and delete (type-the-name confirmation; deleting cascades to the tenant's flags and users).
- **Users** — create tenant-bound accounts with a role.
- **Account** — identity, role, tenant, and token expiry.
- Toasts for mutation results, inline validation, loading/empty/error states everywhere.

**Backend additions still wanted** (plan, section 10)

- `GET /users`, `PATCH /users/{id}`, `DELETE /users/{id}` so the Users screen can list and edit.
- Pagination/search for flags and tenants.
- Flag history for audit/undo, and a restore endpoint for soft-deleted flags.
- A refresh-token or API-key flow; today a session simply ends when the JWT expires.
- Optional `GET /auth/me` and `GET /flags/{id}`.

## Stack

Vite + React 19 + TypeScript, React Router, TanStack Query, Zustand (session/tenant),
React Hook Form + Zod, Tailwind CSS, lucide-react. Linting via oxlint.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:5173> and sign in with `admin` / `admin`.

By default the dev server talks to the deployed service:

- API base (browser): `/api`
- Proxy target: `https://flag-service.onrender.com` (see `vite.config.ts`)
- Swagger: <https://flag-service.onrender.com/swagger-ui/index.html>

### The proxy, and calling the service directly

The dev proxy is the default because it works against a local service with no
configuration and keeps every request same-origin.

Calling the deployed service directly also works, now that the service sends
CORS headers (`app.cors.allowed-origins`, default `*`):

```bash
# .env
VITE_API_BASE_URL=https://flag-service.onrender.com
```

This requires the CORS change to have been **deployed**. Confirm it with:

```bash
curl -i -X OPTIONS https://flag-service.onrender.com/flags \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PATCH" \
  -H "Access-Control-Request-Headers: authorization,x-tenant-id,content-type"
```

Expect `HTTP/2 200` and `Access-Control-Allow-Origin: http://localhost:5173`.
Before the change this returned `401` with no CORS headers, which is why direct
browser calls used to fail.

To restrict who may call the API, set `CORS_ALLOWED_ORIGINS` on the service to a
comma-separated list of origins instead of the `*` default.

### Running against a local service

```bash
cp .env.example .env
# then set VITE_API_PROXY_TARGET=http://localhost:8001
```

### Cold starts

Render's free tier sleeps when idle, so the first request can take 30–60s. The
proxy timeout is set to 120s to cover it; if a request does fail, the UI reports
`The service is unavailable (…)`.

## Auth and tenancy

- `POST /auth/login` returns `{ token, tenantId, role }`.
- Every request except login sends `Authorization: Bearer <token>`.
- Every `/flags` request sends `X-Tenant-Id`, resolved from the session:
  - tenant users use their own tenant;
  - platform admins use the tenant selected in the top bar (flag actions are
    blocked until one is chosen).
- The token has no refresh endpoint, so expiry is enforced client-side and the
  user is returned to login when it lapses.
- Role checks in the UI are cosmetic — the server enforces access on every call.

## Behaviour worth knowing

- Flag **names are immutable**; only the value changes, via `PATCH /flags/{id}`.
- Flag toggles are **optimistic** and roll back if the server rejects the change.
- Deleting a flag is a **soft delete** server-side; the name becomes reusable.
- Deleting a tenant is a **hard cascade** over its flags and users, hence the
  type-the-name confirmation.
- Tenant **names** are shown where possible (resolved from `GET /tenants`). A
  tenant user cannot call that endpoint, so their own tenant is shown as an id.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with API proxy |
| `npm run build` | Type-check and bundle to `dist/` |
| `npm run typecheck` | `tsc -b` only |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build |

## Layout

```
src/
├── app/            # providers + router
├── components/
│   ├── layout/     # AppShell, Sidebar, TopBar, PageHeader
│   └── ui/         # Button, Input, Field, Select, Card, Badge, Alert,
│                   # Spinner, Toggle, Modal, ConfirmDialog, Toaster, CopyButton
├── features/
│   ├── auth/       # login page, session store, guards, tenant hook
│   ├── flags/      # API client, list, create dialog
│   ├── tenants/    # API client, list, create dialog
│   ├── users/      # API client, create form
│   ├── account/    # session details
│   └── common/     # not-found page
├── lib/            # api wrapper, jwt, query client, toast store, formatting, cn
├── types.ts        # API contract types
└── main.tsx
```

## Verification notes

`npm run build` and `npm run lint` are clean.

Verified end-to-end **against the live deployment**
(`https://flag-service.onrender.com`, via the dev proxy): signing in as
`admin` / `admin`, listing tenants, selecting one, and creating, toggling, and
deleting a flag — each persisted and re-read correctly. The tenants list and the
users form were also confirmed against live data.

The build emits a bundle-size advisory (~509 kB, 155 kB gzipped) that
route-level code splitting would clear.

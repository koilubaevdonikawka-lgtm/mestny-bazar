# Architecture: Местный Базар

## Overview

The application follows **Ports & Adapters** (hexagonal) architecture. The frontend is a thin presentation layer; all business logic and external integrations live in the **Platform Layer** (`server/`).

```
Browser (src/)
    ↓ DTO contracts only
Platform API (src/api/ → server/functions/)
    ↓ ports (interfaces)
Domain services (server/domain/)
    ↓ adapters
Supabase | Finik | Telegram
```

## Layer rules

| Layer      | Path                         | May import                       |
| ---------- | ---------------------------- | -------------------------------- |
| Contracts  | `shared/contracts/`          | Nothing external                 |
| Frontend   | `src/**` (except `src/api/`) | `shared/`, `src/api/`            |
| API bridge | `src/api/`                   | `shared/`, `@server/functions/*` |
| Backend    | `server/**`                  | `shared/`, `server/`             |

**Forbidden in frontend:**

- Direct `@supabase/supabase-js` queries (except legacy `src/integrations/supabase/`)
- Direct Finik API calls
- Importing `server/domain`, `server/adapters`, `server/ports`

Enforced via ESLint `no-restricted-imports`.

## Data flow (target)

1. User action in React component
2. `src/api/*.ts` calls `createServerFn` handler
3. Server function invokes domain service
4. Service uses port interface
5. Adapter talks to Supabase / Finik / etc.
6. Response mapped to DTO from `shared/contracts/`
7. Frontend renders DTO — never raw DB rows

## Current state

- **Catalog**: Supabase only, via the Platform API (`src/lib/catalog.ts` → `src/api/catalog.ts` → `SupabaseProductRepository`) — Shopify removed as a catalog source, see [ADR-002](./architecture/adr/ADR-002-complete-shopify-catalog-migration.md).
- **Cart**: server-persisted cart for authenticated users, `localStorage` for guests (`src/stores/cartStore.ts`) — no Shopify sync.
- **Supabase**: sole data source for catalog, orders, users, and every other entity (see `docs/admin-platform/`).
- **Platform API**: `catalog.functions.ts` wired and the only catalog read path in the UI.

## Migration stages

See [stage-1-checklist.md](./stage-1-checklist.md) and [ADR-001](./adr/ADR-001-ports-and-adapters.md).

| Stage | Focus                               |
| ----- | ----------------------------------- |
| 1     | Structure, contracts, boundaries ✅ |
| 2     | Supabase repositories ✅            |
| 3     | Platform catalog + parallel Shopify ✅ |
| 4     | Auth, profile, addresses ✅         |
| 5     | Local cart (no Shopify sync) ✅     |
| 6     | Checkout & orders ✅                |
| 7     | Finik payments (stub — not live)    |
| 8     | Notifications & admin (partial — see `docs/admin-platform/`) |
| 9     | Remove Shopify ✅ (ADR-002, completed ahead of stages 7/8 — Shopify removal did not depend on payments/notifications being finished) |
| 10    | Scale (10k+ orders/day)             |

## Divergence from the original Lovable-generated plan

The original Lovable-generated project plan suggested reading catalog via Supabase RLS from the client. This architecture **rejects** that approach: Supabase Auth JWT is acceptable on the client, but **all data operations** go through `server/functions/*`.

## Environment

| Variable                    | Scope       | Purpose              |
| ---------------------------- | ----------- | --------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`  | server only | repository adapters   |
| `FINIK_*`                    | server only | payment adapter       |

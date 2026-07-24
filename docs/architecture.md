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
Supabase | Finik | Telegram | Shopify (temporary)
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
- Direct Shopify / Finik API calls
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

## Current state (Stage 1)

- **Catalog**: still loaded via `src/lib/shopify.ts` in browser (unchanged)
- **Cart**: Shopify sync via `cartStore` (unchanged)
- **Supabase**: schema + RLS ready; repositories are skeletons
- **Platform API**: `catalog.functions.ts` wired; UI not switched yet
- **Feature flag**: `FEATURE_CATALOG_SOURCE=shopify|platform`

## Migration stages

See [stage-1-checklist.md](./stage-1-checklist.md) and [ADR-001](./adr/ADR-001-ports-and-adapters.md).

| Stage | Focus                               |
| ----- | ----------------------------------- |
| 1     | Structure, contracts, boundaries ✅ |
| 2     | Supabase repositories               |
| 3     | Platform catalog + parallel Shopify |
| 4     | Auth, profile, addresses            |
| 5     | Local cart (no Shopify sync)        |
| 6     | Checkout & orders                   |
| 7     | Finik payments                      |
| 8     | Notifications & admin               |
| 9     | Data migration, remove Shopify      |
| 10    | Scale (10k+ orders/day)             |

## Divergence from Lovable plan

`.lovable/plan.md` suggests reading catalog via Supabase RLS from the client. This architecture **rejects** that approach: Supabase Auth JWT is acceptable on the client, but **all data operations** go through `server/functions/*`.

## Environment

| Variable                      | Scope       | Purpose                    |
| ----------------------------- | ----------- | -------------------------- |
| `FEATURE_CATALOG_SOURCE`      | server      | `shopify` or `platform`    |
| `VITE_FEATURE_CATALOG_SOURCE` | client      | mirrors server flag for UI |
| `SHOPIFY_*`                   | server only | migration adapter          |
| `SUPABASE_SERVICE_ROLE_KEY`   | server only | repository adapters        |
| `FINIK_*`                     | server only | payment adapter            |

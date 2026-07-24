# ADR-001: Ports & Adapters Platform Layer

**Status:** Accepted  
**Date:** 2026-07-16  
**Context:** Местный Базар (Everyday Eats Hub)

## Problem

The app currently calls Shopify Storefront GraphQL directly from the browser. Supabase schema exists but is unused. Secrets are hardcoded in client code. There is no backend business logic for orders, payments, or notifications.

## Decision

Introduce a **Platform Layer** between frontend and all external services using Ports & Adapters:

1. **Contracts** (`shared/contracts/`) — frontend-safe DTOs
2. **Ports** (`server/ports/`) — interfaces for storage, payment, notifications
3. **Adapters** (`server/adapters/`) — Supabase, Finik, Telegram, temporary Shopify
4. **Domain services** (`server/domain/`) — business rules
5. **Transport** (`server/functions/`) — TanStack `createServerFn` handlers
6. **Frontend API** (`src/api/`) — sole bridge from React to server functions

## Consequences

### Positive

- Frontend replaceable without touching business logic
- Payment provider swap = new adapter only
- Secrets stay server-side
- Single source of truth path to Supabase
- Testable domain layer via mocked ports

### Negative

- More files and indirection during migration
- Temporary dual catalog (Shopify + Supabase) until Stage 9
- TanStack Start requires careful bundle boundaries for `server/`

## Alternatives considered

### A. Direct Supabase from frontend (Lovable plan)

Read catalog via RLS `anon` policies. **Rejected:** exposes data model, couples UI to Postgres schema, prevents server-side caching and validation.

### B. Big-bang rewrite

Remove Shopify immediately. **Rejected:** breaks production storefront during migration.

### C. BFF-only without ports

Server functions call Supabase directly. **Rejected:** does not allow swapping Finik/Telegram/Shopify without rewriting handlers.

## Implementation notes

- `FEATURE_CATALOG_SOURCE` enables parallel run
- `ShopifyCatalogAdapter` is temporary (`server/adapters/migration/`)
- ESLint enforces import boundaries
- `src/integrations/supabase/` remains for auth session only until Stage 4

## References

- [docs/architecture.md](../architecture.md)
- [docs/stage-1-checklist.md](../stage-1-checklist.md)

# ADR-002: Complete Shopify Catalog Migration — Supabase Is the Sole Catalog Source

**Status:** Accepted
**Date:** 2026-08-02
**Context:** Местный Базар (Everyday Eats Hub)

## Problem

ADR-001 introduced `FEATURE_CATALOG_SOURCE` (`shopify` | `platform`) to allow a parallel run of the buyer-facing product catalog during the Ports & Adapters migration, explicitly accepting as a **temporary, documented negative consequence**: *"dual catalog (Shopify + Supabase) until Stage 9"*.

An audit (Промпт №014) confirmed this was the **only** remaining violation of the "Server + Database is the single source of truth" principle: with the flag defaulted to `shopify` (`.env.example`, `server/config/env.ts`'s Zod default, `src/config/features.ts`'s fallback), buyer catalog browsing (`server/adapters/migration/shopify.adapter.ts`, `src/lib/shopify.ts`) read product name/price/photo/availability from the external Shopify Storefront API — not from the Supabase `products` table the Admin Platform (`SellerProductService`, `StockAdminService`, `ProductPublicationService`) actually writes to. Checkout, cart validation, and stock reservation were already hard-wired to Supabase regardless of the flag, so a product visible in the Shopify-sourced catalog could fail checkout with `ProductNotSynchronized` unless manually synced — a structural desync risk, not a hypothetical one.

## Decision

Complete the migration ADR-001 marked as pending "until Stage 9": remove `ShopifyCatalogAdapter` as an active catalog source, remove the `FEATURE_CATALOG_SOURCE`/`VITE_FEATURE_CATALOG_SOURCE` switch entirely (nothing left to switch between), and make `SupabaseProductRepository` the unconditional, sole implementation of `IProductRepository` wired in `server/di/container.ts`.

`FEATURE_CHECKOUT_SOURCE`/`VITE_FEATURE_CHECKOUT_SOURCE` is removed alongside it — an audit of every call site confirmed `isPlatformCheckoutEnabled()`/`isPlatformCheckout()` had zero callers; `CheckoutService` already resolved every line item against Supabase unconditionally, so the flag gated nothing at runtime.

## Consequences

### Positive

- "Admin Platform → Supabase → Customer PWA" is now the only data path for the product catalog (categories, products, prices, stock, photos), matching every other entity already audited as single-source (orders, users/roles, banners, coupons, suppliers, couriers).
- One fewer feature-flag branch to reason about, test, and keep in sync (`server/di/container.ts`, `src/config/features.ts` — the latter deleted entirely, nothing left to flag).
- `src/lib/shopify.ts` is deleted, removing a hardcoded Shopify Storefront access token from the client bundle — resolves the PL-07 (Server-Only Secrets) carve-out `scripts/architecture-guard.mjs` had to grant it.
- Ports & Adapters is preserved, not weakened: `IProductRepository` still exists as a port; `SupabaseProductRepository` is still an adapter behind it. This ADR removes a second, now-unneeded *adapter* (`ShopifyCatalogAdapter`), it does not collapse the port/adapter boundary itself — a future catalog provider could still be added as a new adapter without touching `CatalogService`.
- Dependency Injection unaffected: `createServices()` remains the single Composition Root; the only change is that `catalogProducts` is now an unconditional `new SupabaseProductRepository()` instead of an `env`-branched choice.
- Rule Engine (`ProductPublicationService`'s `DRAFT → PUBLISHED → HIDDEN` rules) and Marketplace Events are untouched — neither depended on the catalog source flag.

### Negative

- None identified. Shopify was already not the source of truth for any transactional path (checkout/cart/stock reservation); removing it from the browse/detail path only removes a divergence, it does not remove functionality the Supabase-backed catalog didn't already provide (categories, product CRUD, publication workflow, stock management were all already fully implemented against Supabase — see `docs/admin-platform/catalog.md`, `docs/admin-platform/warehouse.md`).

## Alternatives considered

### A. Keep the flag, just change the default to `platform`

Rejected: leaves dead code (`ShopifyCatalogAdapter`, `src/lib/shopify.ts`, two Zod schemas, two client flags) and a re-introducible footgun — a future deploy could still set `FEATURE_CATALOG_SOURCE=shopify` and silently reintroduce the exact desync this ADR closes. Prompt №015 explicitly asked to remove the switch "if no longer required" — it is not required once Shopify is not a supported source at all.

### B. Remove `ShopifyCatalogAdapter` but keep the flag/schema for a hypothetical future provider

Rejected: YAGNI. No other catalog provider is planned; a real future need can introduce its own ADR and its own flag, informed by the actual new provider's requirements, rather than carrying forward a schema shaped around Shopify specifically (`ShopifyCatalogAdapter`'s GraphQL-specific config, `SHOPIFY_API_VERSION`, etc.).

## Implementation notes

- `server/di/container.ts` — `createProductRepository()` helper removed; `catalogProducts` is now built inline as `new SupabaseProductRepository()`.
- `server/config/env.ts` — `FEATURE_CATALOG_SOURCE`, `FEATURE_CHECKOUT_SOURCE`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION`, `getCheckoutSource()`, `isPlatformCheckoutEnabled()` all removed from the schema/module.
- `src/config/features.ts` — deleted (only consumer was the removed catalog-source branch).
- `src/lib/shopify.ts` — deleted (hardcoded Storefront token + direct browser GraphQL client).
- `server/adapters/migration/shopify.adapter.ts` (+ its test) — deleted.
- `src/lib/catalog.ts` — `fetchCatalogProducts`/`fetchCatalogProduct` now unconditionally call the Platform API (`src/api/catalog.ts`).
- `shared/lib/product-adapter.ts` — `ShopifyProductShim`/`toShopifyProductShim` renamed to `CatalogProductNode`/`toCatalogProductNode` (naming cleanup only, same shape) — the UI-facing product shape is no longer named after a provider that no longer exists. All consumers (`ProductCard.tsx`, `cartStore.ts`, `routes/index.tsx`) updated accordingly.
- `server/domain/integrations-status.service.ts` — removed the "Каталог (миграционный)" `ShopifyCatalogAdapter` row (no longer an active integration).
- `scripts/architecture-guard.mjs` — removed the PL-07 exception carve-out for `src/lib/shopify.ts` (file no longer exists).
- Verified: `typecheck`, `lint`, `test` (633/633), `build`, and `npm run guard` all pass after these changes.

## References

- [ADR-001](../../adr/ADR-001-ports-and-adapters.md)
- [docs/architecture.md](../../architecture.md)
- [docs/admin-platform/catalog.md](../../admin-platform/catalog.md)

# Stage 1 Checklist — Фундамент и границы слоёв

**Goal:** Fix architecture without changing runtime behavior (Shopify storefront still works).

## Done in this stage

- [x] `shared/contracts/` — all DTOs (`catalog`, `cart`, `order`, `payment`, `delivery`, `user`, `api`)
- [x] `server/ports/` — repository and provider interfaces
- [x] `server/adapters/` — skeletons + `ShopifyCatalogAdapter` (server-side)
- [x] `server/domain/` — service skeletons + `CatalogService`
- [x] `server/functions/catalog.functions.ts` — `listProductsFn`, `getProductBySlugFn`
- [x] `server/config/env.ts` — Zod validation + `FEATURE_CATALOG_SOURCE`
- [x] `server/di/container.ts` — composition root skeleton
- [x] `src/api/` — `platformClient`, `catalog`, `orders`, `checkout` stubs
- [x] `src/config/brand.ts` — «Местный Базар»
- [x] `src/config/features.ts` — client feature flag
- [x] `tsconfig.json` — `@shared/*`, `@server/*` paths
- [x] `eslint.config.js` — import boundaries for `src/**`
- [x] `.env` / `.env.example` — Shopify secrets moved server-side
- [x] `sitemap[.]xml.ts` — `APP_URL` / `VITE_APP_URL`
- [x] Branding updated in `__root.tsx`, `SiteFooter.tsx`
- [x] `docs/architecture.md`, `docs/adr/ADR-001-ports-and-adapters.md`

## Explicitly NOT done (later stages)

- [x] UI switch to `src/api/catalog.ts` (Stage 3 — done, see below)
- [x] Remove `src/lib/shopify.ts` (Stage 9 — done, see [ADR-002](./architecture/adr/ADR-002-complete-shopify-catalog-migration.md))
- [x] Supabase repository implementations (Stage 2 — done)
- [ ] Frontend direct Supabase catalog reads (never — use Platform API)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in production secrets

## Verification

```bash
npm run build    # must pass
npm run lint     # must pass (integrations/supabase exempt)
npm run dev      # homepage loads products from Shopify as before
```

## File tree added

```
shared/contracts/
server/
  config/env.ts
  ports/*.ts
  adapters/{supabase,payment,notifications,migration}/
  domain/*.ts
  functions/*.ts
  routes/webhooks/finik.ts
  di/container.ts
src/
  api/{platformClient,catalog,orders,checkout}.ts
  config/{brand,features}.ts
docs/
  architecture.md
  adr/ADR-001-ports-and-adapters.md
  stage-1-checklist.md
```

## Stage 2 — done

`SupabaseProductRepository` and related adapters implemented and wired into `createServices()`
via `server/di/container.ts`.

## Stage 3 — done

Frontend catalog reads switched from direct Shopify Storefront GraphQL calls to the Platform
API, gated by `isPlatformCatalog()` (`src/config/features.ts`, `VITE_FEATURE_CATALOG_SOURCE`).

- `src/lib/catalog.ts` — single switching point: `fetchCatalogProducts()` /
  `fetchCatalogProduct()` call either `src/api/catalog.ts` (platform) or `src/lib/shopify.ts`
  (Shopify), based on the feature flag.
- `src/api/catalog.ts` → `src/api/catalog.functions.ts` (`createServerFn` boundary) →
  `server/di/container.ts` → `CatalogService` → Supabase. Mirrors the existing
  `src/api/orders.ts` / `src/api/orders.functions.ts` pattern.
- `src/lib/product-adapter.ts` — `toShopifyProductShim()` adapts a platform `ProductDTO` into the
  `ShopifyProduct` shape so `ProductCard.tsx`, `CartDrawer.tsx`, and `product.$handle.tsx` needed
  no changes. Platform-sourced cart lines are tagged with a `platform:` prefix on `variantId`
  (`isPlatformVariantId()`), which `cartStore.ts` uses to keep those lines in local state instead
  of calling the Shopify Cart API — the `CartItem` shape and Shopify code paths are unchanged.
- `src/routes/index.tsx`, `src/routes/product.$handle.tsx` — now call `fetchCatalogProducts()` /
  `fetchCatalogProduct()` instead of querying the Shopify Storefront API directly.

Note: `server/functions/catalog.functions.ts` (Stage 1) is no longer called by anything — the
`createServerFn` boundary now lives in `src/api/catalog.functions.ts` instead, since TanStack
Start's `import-protection` plugin denies any client-reachable import under `server/**`
regardless of whether the target is `createServerFn`-wrapped. Left in place, not deleted.

## Stage 9 — done

`src/lib/shopify.ts`, `server/adapters/migration/shopify.adapter.ts`, `FEATURE_CATALOG_SOURCE`,
and `FEATURE_CHECKOUT_SOURCE` all removed — see
[ADR-002](./architecture/adr/ADR-002-complete-shopify-catalog-migration.md).
`SupabaseProductRepository` is now the unconditional, sole `IProductRepository` implementation.

## Acceptance criteria (Stage 1)

| Criterion                                | Status       |
| ---------------------------------------- | ------------ |
| Project builds                           | ⏳ verify    |
| Shopify catalog works in browser         | ✅ unchanged |
| New folders exist                        | ✅           |
| ESLint blocks `src/` → `server/domain`   | ✅           |
| `FEATURE_CATALOG_SOURCE=shopify` default | ✅ (Stage 1; flag removed entirely at Stage 9, ADR-002) |

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

- [ ] UI switch to `src/api/catalog.ts` (Stage 3)
- [ ] Remove `src/lib/shopify.ts` (Stage 9)
- [ ] Supabase repository implementations (Stage 2)
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

## Next: Stage 2

1. Implement `SupabaseProductRepository`, `SupabaseOrderRepository`, etc.
2. Map DB rows → DTOs in adapters (no Supabase types in `shared/`)
3. Unit tests with mocked Supabase client
4. Wire `createServices()` with real adapters
5. Do **not** connect frontend yet

## Acceptance criteria (Stage 1)

| Criterion                                | Status       |
| ---------------------------------------- | ------------ |
| Project builds                           | ⏳ verify    |
| Shopify catalog works in browser         | ✅ unchanged |
| New folders exist                        | ✅           |
| ESLint blocks `src/` → `server/domain`   | ✅           |
| `FEATURE_CATALOG_SOURCE=shopify` default | ✅           |

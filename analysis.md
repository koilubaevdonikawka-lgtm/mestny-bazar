# Everyday Eats Hub («Местный Базар») — Architecture Analysis

Read-only analysis. No files were modified. Based on: `package.json`, `tsconfig.json`, `eslint.config.js`,
`.env` / `.env.example`, `docs/**`, `server/**` (4,889 `.ts` files), `src/**` (106 files), `shared/contracts/**`,
committed `tsc-output.txt` / `tsc-analytics.txt`, and the real composition root `server/di/container.ts`.

---

## 1. Architecture overview

### Stack
TanStack Start (React 19) + Vite 8 + Nitro, Tailwind v4, Zustand, TanStack Query/Router, Supabase (Postgres +
Auth), Shopify Storefront (legacy catalog, being migrated off), Finik (payments), Telegram (notifications).
Package management is ambiguous: both `bun.lock` and `package-lock.json` are committed.

### Documented target architecture
The project has an unusually thorough, coherent architecture spec for its size: `docs/architecture.md`,
`docs/PROJECT_STANDARDS.md`, 14 numbered principles in `docs/principles/`, and `docs/adr/ADR-001-ports-and-adapters.md`.
The stated model is classic **Ports & Adapters (hexagonal)**, not Clean Architecture concentric circles, though
the two overlap:

```
Browser (src/**)
   → src/api/*  (Platform API bridge — only allowed frontend/server crossing point)
   → server/functions/* (TanStack createServerFn handlers — the "transport")
   → server/domain/*  (business rules; depends on ports, never adapters)
   → server/ports/*  (interfaces)
   → server/adapters/*  (Supabase / Finik / Telegram / Shopify-migration)
```

Composition happens in exactly one place by design: `server/di/container.ts` (Principle 5, "Composition Root" —
"all dependency wiring only in `server/di/container.ts`; separate factory files are not allowed").
`shared/contracts/` holds frontend-safe DTOs so DB/provider types never leak into the UI (Principle 4).
Import boundaries are meant to be enforced by ESLint (Principle 6).

### What is actually running
This part of the spec is real and is currently exercised end-to-end:

- `server/di/container.ts` (257 lines) is a single, hand-written, constructor-injection container — no DI
  framework, no decorators. It wires: `CatalogService`, `CheckoutService`, `OrderService` (+ Admin/Warehouse/Courier
  variants), `SellerProductService`, `AddressService`, `PaymentPolicyService`, `OrderLifecycleService`,
  `ProductPublicationService`, `MarketplaceStandardsService`, `MarketplaceEventsService` (pub/sub event bus),
  `AuditLogService`, `NotificationCenter`, and an `AIWorkerRegistry`/`AIOrchestrator` pair for media/catalog
  quality analysis.
- `server/functions/*.executor.ts` and `*.functions.ts` (addresses, admin, catalog, checkout, courier, orders,
  seller, warehouse) are the only consumers of `container.ts`, and are in turn the only things `src/api/*.ts`
  calls. This is the real, working request path.
- Adapters match ADR-001 exactly: `server/adapters/{supabase,payment,notifications,migration}` — real
  `SupabaseProductRepository`, `SupabaseOrderRepository`, `FinikPaymentAdapter`, `ShopifyCatalogAdapter`
  (feature-flagged via `FEATURE_CATALOG_SOURCE`), stub notification/order-event adapters.
- **Rule-engine pattern** (Principle 12) is genuinely implemented, not just documented: `PaymentPolicyService`
  and `OrderLifecycleService` each take an ordered array of small rule classes
  (`CashRequiresAuthenticationRule`, `WarehouseStartAssemblyRule`, `CourierArriveRule`, etc.), each exposing
  `order`/`terminal`/`applies`/`evaluate`. This is the strongest piece of DDD-flavored design in the codebase —
  policy logic is out of the orchestrating services and into single-responsibility, independently testable rules.
- Domain events are real: `MarketplaceEventsService` is subscribed to by `NotificationCenter`, `AuditLogService`,
  and `AIOrchestrator` (`subscribeNotificationCenter`, `subscribeAuditLog`, `subscribeAIWorkers` in
  `container.ts`), giving genuine decoupling between order/catalog actions and their side effects.
- ESLint (`eslint.config.js`) enforces the frontend-facing half of the boundary rules: `src/**` (excluding
  `src/api/**` and the legacy `src/integrations/supabase/**`) is blocked from importing `@supabase/supabase-js`
  directly or anything under `server/**`. This is a real, working guardrail for Principles 1 and 7.

### What is documented as "current state" but is stale
`docs/architecture.md` says catalog is "still loaded via `src/lib/shopify.ts` in browser" and Supabase
repositories are "skeletons." The container shows Supabase repositories are actually implemented and
feature-flag-switchable (`isPlatformCatalogEnabled()`), so the docs lag the code here — a minor but real
docs/code drift.

---

## 2. Module map

### Real, wired system (small, coherent)
```
shared/contracts/          DTOs shared frontend↔backend
src/api/*.ts                Platform API bridge (13 files: orders, warehouse, courier, seller, catalog,
                             addresses, checkout, admin — each with a .functions.ts pair)
server/functions/           createServerFn handlers + *.executor.ts (14 files)
server/di/container.ts      single composition root
server/domain/              catalog, order, order-lifecycle/, payment-policy/, product/, product-publication/,
                             seller, marketplace-ai/, marketplace-events/, marketplace-standards/, audit-log/
server/ports/                interfaces (IOrderRepository, IPaymentProvider, IPaymentPolicy, …)
server/adapters/             supabase/, payment/ (Finik), notifications/, migration/ (Shopify)
server/routes/webhooks/      finik.ts
supabase/migrations/         schema
src/**                       React app (routes/, components/, stores/ (zustand), hooks/, lib/)
```
This slice is ~small relative to the repo — a rough file count puts the demonstrably-wired server code at a
few hundred files, against 4,889 `.ts` files under `server/` in total.

### Parallel, apparently unwired system (large, not coherent)
A second full "enterprise platform" tree exists alongside the real one, mirroring it module-for-module but not
reachable from `vite.config.ts` → `src/server.ts` → `server/functions/*` → `container.ts`:

| Directory | Size | Contents |
|---|---|---|
| `server/application/ai-*-registry` (87 dirs) | 1,222 files | Near-identical scaffolds: `contracts/`, `models/`, `services/`, `use-cases/` per "registry" (accelerator-profile, benchmark, capability, dataset, ethics, governance, knowledge-graph, ontology, taxonomy, …) |
| `server/infrastructure/ai-*-registry` (87 dirs, mirrors above) | 435 files | Same registries, infra-layer half |
| `server/application/{*-management}` (~25 dirs) | — | analytics, audit, cache, cart, catalog, checkout, customer, delivery, event-bus, favorites, feature-flag, health-monitoring, idempotency, logging, metrics, notification, order, payment, plugin, rate-limiting, scheduling, search, secrets, warehouse, workflow-orchestration |
| `server/application/modules/*` | — | A **second** set of the same business modules (cart, catalog, checkout, order, payment, seller, warehouse, …), each with a self-duplicated nested folder, e.g. `modules/cart/cart/` |
| `server/infrastructure/{*-management}` | — | Infra half of the same ~25 management modules, plus `supabase/`, `payments/`, `notifications/`, `event-bus/`, `repositories/` — a second copy of the adapters that already exist in `server/adapters/` |
| `server/api/modules/*` | 249 importers | Controllers for **every** ai-registry and every management module, plus a duplicate `cart`, `checkout`, `favorites`, `search`, `seller-product` set |
| `server/api/server/` | — | A second, "framework-agnostic" `ApiServer` class with its own route matcher/middleware pipeline, independent of TanStack Start |
| `server/bootstrap/*` | 130+ files | One `*-bootstrap.ts` file per ai-registry/management module, plus `composition-root.ts`, `application-bootstrap.ts`, `api-bootstrap.ts` — a **second composition-root system** |
| `server/transports/http/` | — | An Express adapter (`express-bootstrap.ts`, `express-http-server.ts`) wired to `composition-root.ts` |
| `server/platform/*` (~20 dirs) | — | `ai`, `architecture-intelligence`, `autonomous-governance`, `digital-twin`, `evolution`, `governance`, `knowledge`, `decision`, `release`, `sdk` — concepts with no relationship to a food-marketplace domain |
| `server/observability/`, `server/security/`, `server/jobs/` | — | Parallel tracing/metrics/health, auth/roles/tokens, and job-queue/scheduler subsystems, structurally separate from the real `server/domain` + `container.ts` path |

**Verified orphan status:** `grep` for the only two entry points that matter — `vite.config.ts` (which points to
`src/server.ts` as the SSR entry) and `package.json` scripts (`vite dev`, `vite build`, nothing else) — turns up
no reference to `server/api/server/`, `server/bootstrap/composition-root.ts`, or
`server/transports/http/bootstrap/express-bootstrap.ts` outside that tree's own files. The Express transport is a
fully self-contained second application that nothing starts. `getServices()`/`container.ts`, the actual composition
root, imports zero AI-registry or `*-management` modules.

---

## 3. Potential architectural issues

1. **Two competing composition roots.** `server/di/container.ts` (real, used) and
   `server/bootstrap/{composition-root,application-bootstrap,api-bootstrap}.ts` + 130 per-module bootstrap files
   (apparently unused) directly contradict the project's own Principle 5 ("composition only in `container.ts`;
   separate factory files are not allowed"). If anyone ever wires the second system in, the project will have two
   sources of truth for how services are constructed.
2. **Duplicate adapters for the same external systems.** `server/adapters/supabase/` (8 files, actually used) and
   `server/infrastructure/supabase/` (10 files, unused) both implement Supabase access. Same pattern for
   payments/notifications. Any future change to schema or provider behavior risks being made in the wrong copy.
3. **No enforced dependency rule inside `server/`.** ESLint's `no-restricted-imports` only constrains
   `src/**` → `server/**` crossings. Nothing in `eslint.config.js` stops `server/domain` from importing
   `server/adapters` directly, or stops `server/application`/`server/infrastructure`/`server/platform` from
   importing across each other arbitrarily — Principle 3 ("domain depends on ports, never adapters") is
   documented but not machine-enforced anywhere except by convention in the real (small) slice of the code.
4. **`server/api/modules` controllers reference the orphaned application/infrastructure ai-registry services**
   (173+ cross-references confirmed by grep), so that subtree is internally consistent — but it is a second,
   parallel domain model (registries, profiles, catalogs) that has no product requirement traceable to a food
   marketplace. If it's ever connected to a live route, its "domain" objects (accelerator profiles, ethics
   profiles, governance policies) will collide conceptually with the real one (products, orders, sellers).
5. **`noUnusedLocals`/`noUnusedParameters` are off, and `@typescript-eslint/no-unused-vars` is explicitly
   disabled** (`eslint.config.js:36`). This is very likely *why* thousands of unreachable files can sit in the
   repo without either `tsc` or `eslint` ever flagging them as dead — there is no tooling signal that would
   naturally surface this sprawl.
6. **Frontend/API layering is thinner than the backend's stated ambitions.** `src/` is 106 files against 4,889
   in `server/`; the "Platform Layer" principle intends the frontend to be a thin client, which it is, but the
   backend's actual surface (the wired part) is also small — the ratio is explained by the orphan tree, not by a
   deep, load-bearing backend.

---

## 4. Technical debt

1. **The project does not currently type-check.** Two files are committed at repo root —
   `tsc-output.txt` (213 lines) and `tsc-analytics.txt` (143 lines) — capturing a broken `tsc` run:
   - Real errors in **wired, production code**: `server/adapters/supabase/{order,product,seller-product,address}.repository.ts`
     reference a `publication_status` column that the generated Supabase types say does not exist on `products`
     (schema/generated-types drift — the DB migration and the TypeScript types disagree), plus null-safety and
     `RejectExcessProperties` violations. `server/domain/order` (10 errors), `server/domain/catalog` (6),
     `server/domain/product` (3) also fail.
   - **136+ raw syntax errors** (`TS1005 ';' expected`, `':' expected`) in
     `server/infrastructure/analytics/wiring/event-publishing-{product,seller}.service.ts` — these aren't type
     errors, the files are malformed TypeScript and cannot parse. This is in the orphaned tree, but it still
     fails a full `tsc` build of the project.
   - Net effect: `npm run build` / any CI type-check gate is presumably red right now, or is being run scoped to
     avoid these paths.
2. **Massive dead-code surface.** Roughly 1,650+ files across `server/application/ai-*-registry` and
   `server/infrastructure/ai-*-registry` alone (87 near-identical modules × ~14 files, doubled across two
   layers), plus ~25 duplicated `*-management` modules in triplicate (`application/`, `infrastructure/`,
   `api/modules/`), plus a second `bootstrap/` system, plus an unstarted Express transport. This dwarfs the
   working application by roughly an order of magnitude in file count and is a severe maintenance/onboarding
   liability even though it's inert today — every future refactor, dependency bump, or search-and-replace has to
   account for it.
3. **Docs/code drift.** `docs/architecture.md`'s "Current state (Stage 1)" section describes Supabase
   repositories as "skeletons," but `container.ts` and the adapters show real, feature-flagged implementations.
   Anyone onboarding from the docs alone would underestimate how much is actually built.
4. **Package manager ambiguity.** Both `bun.lock` and `package-lock.json` are committed with no indication in
   `README`/`AGENTS.md` of which is canonical; `bunfig.toml` suggests Bun is intended, but `package-lock.json`'s
   presence means `npm install` also "works," silently producing a possibly different dependency tree.
5. **Two `tsc-*.txt` dump files committed to repo root** rather than being gitignored/CI artifacts — they will
   go stale the moment anyone fixes or introduces an error, and are already a form of technical debt themselves
   (dead documentation of a point-in-time failure).

---

## 5. Suggestions for improvement

1. **Decide the fate of the orphan tree before anything else.** For each of `server/application/ai-*`,
   `server/infrastructure/ai-*`, the duplicated `*-management` trees, `server/api/modules` (non-real-domain
   parts), `server/bootstrap/*-bootstrap.ts`, `server/platform/*`, and `server/transports/http`: either (a)
   confirm it's genuinely planned future work and move it behind a clearly labeled `experimental/` or separate
   package boundary so it doesn't dilute the real architecture, or (b) delete it. Given none of it is reachable
   from the real entry point and it fails to compile in places, deletion is very likely the right default —
   verify with the team/product owner first since this is a large, hard-to-reverse change.
2. **Fix the schema/type drift first** (`publication_status` on `products`) since it's in the live request path
   (`server/adapters/supabase/*.repository.ts`) — regenerate Supabase types from the actual migrated schema and
   get `tsc` green on `server/domain/**` and `server/adapters/**` specifically before touching anything else.
3. **Turn the documented dependency rule into an enforced one.** Add ESLint `no-restricted-imports` (or a tool
   like `dependency-cruiser`) constraints so `server/domain/**` cannot import `server/adapters/**` directly, and
   so whatever survives from `server/application`/`server/infrastructure` can't reach across unrelated modules.
   This is cheap relative to the value: it's exactly the kind of rule that would have made the current sprawl
   visible much earlier.
4. **Re-enable `noUnusedLocals`/`noUnusedParameters` and `@typescript-eslint/no-unused-vars`**, at least as
   warnings, and add an unused-exports/dead-file checker (e.g. `ts-prune` or `knip`) to CI. Given the current
   sprawl this will be noisy at first, but it's the single highest-leverage guardrail against this pattern
   recurring.
5. **Reconcile the lockfiles**: pick Bun or npm, delete the other lockfile, and state the choice in
   `AGENTS.md`/`docs/PROJECT_STANDARDS.md`.
6. **Update `docs/architecture.md`'s "Current state" section** to match what `container.ts` actually wires
   (Supabase repositories are implemented and flag-switchable, not skeletons), so the docs stay trustworthy as
   the single onboarding artifact — they are otherwise a genuine strength of this repo and worth keeping
   accurate.
7. **If any part of the AI-registry/platform tree represents real, intended scope** (it reads like a generic
   "AI governance platform" scaffold, not e-commerce), split it into its own package/repo rather than living
   inside `server/` next to the marketplace domain — mixing two unrelated domains in one `server/` tree is the
   root cause of items 1–4 above.
8. **Move `tsc-output.txt`/`tsc-analytics.txt` out of the repo** and into CI logs or `.gitignore`; if a
   persistent record of known type errors is wanted, track it as a small curated list (e.g. `KNOWN_ISSUES.md`)
   rather than a raw `tsc` dump that goes stale immediately.

---

*Note: this repository has no `.git` directory, so history/blame could not be used to corroborate how the
orphaned tree came to exist; the "apparently AI/template-generated, never wired in" conclusion above is based on
static structural evidence (near-identical file scaffolds per module, zero references from the real entry point,
syntax errors in unreached files) rather than commit history.*

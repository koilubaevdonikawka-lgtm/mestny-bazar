# Architecture Principles — Recovery Document

**Status:** archaeological recovery, not a new specification
**Purpose:** consolidate every architecture principle already governing «Местный Базар» into one document, with its original source cited
**Method:** this document does not invent, merge, or rewrite anything. Every entry below is either (a) transcribed from an existing documentation source, or (b) reconstructed from a repeated, multi-file pattern in the code and explicitly marked `PARTIALLY RECOVERED` because no single authoritative rationale for it exists in writing. Where a principle could not be reconstructed at all, it is listed in §6 (Missing Principles) instead of fabricated as an entry.

Sources scanned: `docs/PROJECT_STANDARDS.md`, all 14 files in `docs/principles/`, `docs/adr/ADR-001-ports-and-adapters.md`, `docs/architecture.md`, `docs/architecture/ARCHITECTURE_POLICY.md`, `docs/architecture/ONBOARDING_BOUNDARY.md`, `docs/stage-1-checklist.md`, `docs/manual-test-scenarios.md`, the root-level audit trail (`ARCHITECTURE_AUDIT.md`, `ARCHITECTURE_AUDIT_RESOLUTION.md`, `IMPLEMENTATION_PLAN_A.md`, `analysis.md`), `eslint.config.js`, `tsconfig.json`, `server/di/container.ts`, every `server/ports/*`, `server/domain/**`, `server/adapters/**` file reachable from the composition root, and inline code comments throughout.

**Revision log:**

| Date | Change |
|---|---|
| 2026-08-01 | Document created — 41 principles recovered. |
| 2026-08-01 | Audit pass: fixed inconsistent section numbering (`§5a` → `§5`; the summary section, previously mislabeled `§5`, is now `§6`) and all cross-references to it. Verified all 60+ file paths cited throughout the document against the current repository state — no broken references found. No new principle content added or changed by this pass; see the chat-delivered audit report for the full methodology and findings (duplicates, contradictions, formatting, link freshness). |

---

## §1. Recovered from `docs/principles/` (14 documents)

These are transcribed near-verbatim from their source files (originally in Russian; translated here, structure preserved). Status: **FULLY RECOVERED** — the source text is complete and unambiguous. Where the document's own examples are stale relative to current code, this is noted separately and does not reduce recovery status (the *document* is fully recovered; its *currency* is a different question).

---

### PL-01 — Platform Layer

**Description:** The frontend interacts with data **only** through the Platform API (`src/api/` → `server/functions/`). Direct calls to external services from the browser are forbidden. The one exception: a Supabase Auth JWT is permitted client-side, but only to obtain a session — all data operations go through server functions.

**Rationale (as stated):** Secrets stay server-side; business logic is centralized; the frontend is replaceable without rewriting the domain.

**Consequences:** `src/**` may import `shared/contracts/` and `src/api/*` only; it may not import `@supabase/supabase-js` (for data), the Shopify/Finik APIs, or `server/domain`/`server/adapters`.

**Affected modules:** `src/**`, `src/api/`, `shared/contracts/`.

**Source:** `docs/principles/01-platform-layer.md`

---

### PL-02 — Ports & Adapters

**Description:** External systems (Supabase, Finik, Telegram, Shopify) are connected **only** through adapters implementing ports (interfaces) defined in `server/ports/`. Layering: `Domain Service → Port (interface) → Adapter → External System`.

**Rationale (as stated):** A port describes *what* the domain needs, not *how* it is implemented; the adapter knows API/DB details, the domain does not; swapping a provider means a new adapter, with no domain change.

**Consequences:** Every external dependency the domain needs must be expressed as a port interface (examples given: `IProductRepository`, `IOrderRepository`, `IPaymentProvider`, `INotificationProvider`) before any adapter is written.

**Affected modules:** `server/ports/`, `server/adapters/`, `server/domain/`.

**Source:** `docs/principles/02-ports-and-adapters.md`

---

### PL-03 — Dependency Rule

**Description:** Dependencies point **inward**: Domain depends on ports, but **never** on concrete adapters. Forbidden: `class CatalogService { private shopify = new ShopifyCatalogAdapter(); }`. Required: `class CatalogService { constructor(private readonly products: IProductRepository) {} }`. The choice of implementation (Shopify vs. Supabase) happens **only** in `server/di/container.ts`.

**Rationale:** Not separately stated beyond the mechanism itself; implied continuation of PL-02's replaceability goal.

**Consequences:** No `server/domain/**` file may construct an adapter with `new`. Violations are the single named failure mode the project's own audit tooling looks for (see F4 in `ARCHITECTURE_AUDIT.md`, one confirmed live violation: `checkout.service.ts` importing `isUuid` from an adapter path, resolved).

**Affected modules:** `server/domain/`, `server/di/container.ts`.

**Source:** `docs/principles/03-dependency-rule.md`

---

### PL-04 — DTO Contracts

**Description:** The frontend knows **only DTOs** from `shared/contracts/`. No DB types, Shopify GraphQL types, or Finik payload shapes may appear in the UI. Provider-specific field names are renamed at the mapping boundary (example given: DB `finik_payment_url` → Adapter → DTO `paymentUrl`).

**Rationale:** Not separately stated; implied insulation of the frontend from provider identity (consistent with PL-09, Replaceable Adapters).

**Consequences:** `server/adapters/` owns all DB-row → DTO mapping; `src/` may only import from `shared/contracts/`; contracts must never contain a provider name in a field name.

**Affected modules:** `shared/contracts/`, `server/adapters/`, `src/`.

**Source:** `docs/principles/04-dto-contracts.md`

---

### PL-05 — Composition Root

**Description:** All dependency composition happens **only** in `server/di/container.ts`. Separate factory files for assembling services are not permitted. The container is responsible for: creating adapters, binding ports to implementations, registering rule chains (Payment Policy, Order Lifecycle), and selecting an implementation by feature flag.

**Rationale:** Not separately stated beyond the single-source-of-truth mechanism itself.

**Consequences:** Forbidden: a `factory.ts` for Policy services, `new Adapter()` inside domain services, module-level singletons outside the container. This is the principle whose verbatim text (`"вся композиция зависимостей происходит только в server/di/container.ts"`) `ARCHITECTURE_AUDIT.md` quotes directly as the one an entire orphaned ~4,600-file second composition root violated (Finding F1/F2; resolved by deletion).

**Affected modules:** `server/di/container.ts`.

**Source:** `docs/principles/05-composition-root.md`

---

### PL-06 — Import Boundaries

**Description:** Layer boundaries are enforced mechanically by ESLint `no-restricted-imports` and path aliases (`@shared/*`, `@server/*`). Import matrix: `src/**` (except `src/api/`) may import `shared/`, `src/api/`; `src/api/` may import `shared/`, `@server/functions/*`; `server/**` may import `shared/`, `server/`. Named exceptions: `src/integrations/supabase/` (legacy auth, temporary) and `src/api/` (the bridge itself).

**Rationale (as stated):** Prevent Supabase and server code from leaking into the client bundle.

**Consequences:** Enforcement is real and verified in the current `eslint.config.js` (`no-restricted-imports` blocks `@supabase/supabase-js` and `@server/*`/`../server/*` patterns for `src/**`, with `src/api/**` and `src/integrations/supabase/**` explicitly exempted) — matching the documented matrix. **Known gap:** the same file has **no equivalent rule constraining imports within `server/**` itself** — nothing stops `server/domain` from importing `server/adapters` directly. This gap is independently documented as Finding F9 in `ARCHITECTURE_AUDIT.md`, named there as the root-cause mechanism that let an orphaned ~4,600-file duplicate architecture (Findings F1/F2/F3/F6) accumulate undetected before being deleted. As of this recovery, F9 remains unresolved (see §6).

**Affected modules:** `eslint.config.js`, `tsconfig.json`, all of `src/`, `server/`.

**Source:** `docs/principles/06-import-boundaries.md`; enforcement gap corroborated by `ARCHITECTURE_AUDIT.md` §F9.

---

### PL-07 — Server-Only Secrets

**Description:** API keys, tokens, and service-role keys **never** reach the client bundle. Server-only variables named: `SHOPIFY_STOREFRONT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `FINIK_API_KEY`, `TELEGRAM_BOT_TOKEN`. Client-safe variables named: `VITE_SUPABASE_URL`, `VITE_FEATURE_CATALOG_SOURCE`, `VITE_APP_URL`. Validation: `server/config/env.ts` (a Zod schema for server env at startup).

**Rationale:** Not separately stated beyond the secrecy goal itself.

**Consequences:** Any new server-only credential must be added to the Zod schema in `server/config/env.ts` and never prefixed `VITE_`. **Note:** at time of recovery, `src/lib/shopify.ts` hardcodes `SHOPIFY_STOREFRONT_TOKEN` as a client-side constant (a Shopify *Storefront* token, which is designed to be public-safe by Shopify's own model) — this is a naming/documentation tension worth flagging, not necessarily a violation, since the principle's table itself lists this exact token as "server-only" while the current code ships an equivalent literal client-side for catalog fetching.

**Affected modules:** `server/config/env.ts`, `.env` / `.env.example`, `src/lib/shopify.ts`.

**Source:** `docs/principles/07-server-only-secrets.md`

---

### PL-08 — Storage as Implementation Detail

**Description:** Supabase (Postgres, Auth, Storage) is an **implementation detail**, not part of the application's public API. RLS policies granting `anon SELECT` on the catalog are **not** to be used directly from the UI; all data operations go through `server/adapters/supabase/`; `Database` row → DTO mapping happens only in adapters; `src/integrations/supabase/types.ts` is not imported from routes/components. Explicitly **rejects** the original Lovable-generated plan, which proposed reading the catalog directly via RLS.

**Rationale (stated as a rejection):** the original Lovable plan's direct-RLS-read approach is rejected by this principle.

**Consequences:** Any future temptation to "just read Supabase directly from a component for speed" is a documented, named rejection, not an open question.

**Affected modules:** `server/adapters/supabase/`, `src/integrations/supabase/`.

**Source:** `docs/principles/08-storage-as-detail.md`; corroborated by `ADR-001` Alternative A ("Direct Supabase from frontend (Lovable plan)... Rejected").

---

### PL-09 — Replaceable Adapters

**Description:** Any external service must be replaceable **without changing** domain services or the frontend. Table of current replaceable components: Catalog (`IProductRepository`, Supabase/Shopify), Orders (`IOrderRepository`, Supabase), Payment (`IPaymentProvider`, Finik), Notifications (`INotificationProvider`, Telegram/WhatsApp), Storage (`IStorageService`, Supabase Storage). Replacement criterion: swapping a provider means a new file under `server/adapters/` plus wiring in the container — domain, contracts, and frontend are unchanged. Migration adapters (`server/adapters/migration/`) are temporary and are deleted after full migration (Stage 9).

**Rationale:** Not separately stated beyond the mechanism.

**Consequences:** `ShopifyCatalogAdapter` (`server/adapters/migration/`) is explicitly scoped as temporary under this principle — its continued presence today is expected, not drift, until Stage 9.

**Affected modules:** `server/adapters/`, `server/adapters/migration/`, `server/di/container.ts`.

**Source:** `docs/principles/09-replaceable-adapters.md`

---

### PL-10 — Policy Rule Engines

**Description:** Cross-cutting "may / may not" business logic is factored into **Policy modules** with a universal rule engine, rather than living in orchestrator services. Standard module structure: `server/ports/` (`IPolicy` with `can`/`assert`), `server/domain/<policy>/*.service.ts` (the engine: sorting, chaining, terminal handling), `*.rule.ts` (the rule interface), `*-order.ts` (named `order` constants), `rules/` (rule implementations). Mechanism table: `order` (ascending execution order), `terminal` (`false` = guard continues the chain), `applies()` (does this rule participate?), `evaluate()` (allowed/denied result).

**Rationale:** Not separately stated beyond the reuse/consistency goal.

**Consequences:** The document's own "Implemented Policies" table lists only Payment (`OnlineAllowedRule`, `CashRequiresAuthenticationRule`) and Order Lifecycle with the note *"chain in container (currently `[]`)"* — this is **stale relative to current code**: `server/di/container.ts` today registers 10 Order Lifecycle rules plus a third policy engine, Product Publication, not mentioned in this document at all. The principle's *text* is fully recovered; its example table describes an earlier, since-superseded state of the codebase.

**Affected modules:** `server/ports/`, `server/domain/payment-policy/`, `server/domain/order-lifecycle/`, `server/domain/product-publication/`.

**Source:** `docs/principles/10-policy-rule-engines.md`

**⚠ Possible duplicate:** see PL-12 below — the two documents describe substantially the same mechanism.

---

### PL-11 — Feature Flags

**Description:** Parallel rollout of old and new behavior happens via feature flags, not branching in the UI or domain. Current flags: `FEATURE_CATALOG_SOURCE` (`shopify`/`platform`), mirrored to the client as `VITE_FEATURE_CATALOG_SOURCE`. Rule: the adapter choice happens in the Composition Root by flag; domain services never read `env` directly; default is `shopify` (current storefront behavior). Migration plan stated: "Stage 3: platform catalog available behind the flag; Stage 9: platform is default, Shopify removed."

**Rationale:** Not separately stated beyond enabling safe parallel rollout.

**Consequences:** `createProductRepository(env)` in `server/di/container.ts` is the one place implementing this — confirmed current and consistent with the principle. **Note:** `src/config/features.ts` also defines `FEATURE_CHECKOUT_SOURCE`/`isPlatformCheckout()`, a second flag not mentioned in this document at all — evidence the document predates that flag's introduction.

**Affected modules:** `server/di/container.ts`, `server/config/env.ts`, `src/config/features.ts`.

**Source:** `docs/principles/11-feature-flags.md`

---

### PL-12 — Rule Engine Standard

**Description:** Every Policy module with a rule chain uses **one standard engine shape**: `order → applies → evaluate → terminal`. The engine is generic; business rules live in separate `rules/` classes. Documented interface:
```typescript
interface PolicyRule<TContext, TResult> {
  readonly order: number;
  readonly terminal?: boolean; // default: true
  applies(context: TContext): boolean;
  evaluate(context: TContext): TResult;
}
```
Engine algorithm (stated as 5 steps): sort rules by `order` ascending; for each, if `applies()` call `evaluate()`; on `!allowed`, deny immediately; on `allowed` and `terminal !== false`, allow immediately; if nothing matched, deny with `NO_MATCHING_RULE`/`UNKNOWN_*`. Documented port shape: `interface IPolicy<TContext, TResult> { can(context): TResult; assert(context): void; }`. Named-order convention shown via example `PaymentPolicyOrder = { GLOBAL_GUARD: 10, CASH_AUTH: 80, ONLINE: 90 }`. Forbidden: hardcoded rule order inside `*.service.ts`; `if (paymentMethod === "CASH")` in orchestrators (`CheckoutService`, `OrderService`); separate `factory.ts` files for assembling rule chains.

**Rationale:** Not separately stated as a distinct paragraph; embedded in the "forbidden" list's implicit reasoning (orchestrators should delegate, not decide).

**Consequences:** This is the most faithfully and completely implemented principle in the codebase. Confirmed live in three independent engines: `PaymentPolicyService`/`IPaymentPolicy` (`payment-policy-order.ts`), `OrderLifecycleService`/`IOrderLifecyclePolicy` (`order-lifecycle-order.ts`, `OrderLifecycleOrder = { GLOBAL_GUARD:10, AUTHORITY:20, TRANSITION_MATRIX:30, ROLE_PERMISSION:40, PAYMENT_GATE:50, FINAL:90 }`), and `ProductPublicationService`/`IProductPublicationPolicy` (`product-publication-order.ts`) — all three follow the named-order-constants-per-policy convention exactly. **Documented-vs-implemented gap:** the generic `IPolicy<TContext,TResult>` port with `can`/`assert` method names is **not** literally implemented — the three real ports use policy-specific method names instead (`canTransition`/`assertCanTransition`, `canUsePaymentMethod`/`assertCanUsePaymentMethod`), not a shared generic interface. The *semantic* contract (a boolean-ish check plus an asserting throw-variant) is honored everywhere; the literal generic-type shape in the document is not.

**Affected modules:** `server/domain/payment-policy/`, `server/domain/order-lifecycle/`, `server/domain/product-publication/`, `server/ports/{payment-policy,order-lifecycle,product-publication}.port.ts`.

**Source:** `docs/principles/12-rule-engine-standard.md`

**⚠ Possible duplicate:** see PL-10 above (same mechanism, two documents). **⚠ Possible duplicate/naming collision:** see POL-06 below — `ARCHITECTURE_POLICY.md` also defines something called "Rule Engine (Движок правил)," but as a *future, admin-configurable, no-deploy-needed* BCM for loyalty/marketing rules — a different scope and status (not implemented) from this document's *already-implemented*, code-level engine. Same name, materially different concept; both are recovered as-is per instruction not to merge.

---

### PL-13 — Engineering Roles

**Description:** Every layer of the Platform Layer has **one zone of responsibility**. Layer-responsibility table:

| Layer | Path | Responsible for | Forbidden |
|---|---|---|---|
| Contracts | `shared/contracts/` | DTOs, enums, API errors | Importing external SDKs |
| Frontend | `src/**` (except `src/api/`) | UI, local state | `server/*`, direct data calls to Supabase/Shopify/Finik |
| API bridge | `src/api/` | Typed wrappers → `createServerFn` | Business logic, direct DB access |
| Transport | `server/functions/` | Input validation, calling domain, DTO mapping | SQL, HTTP to external APIs |
| Domain | `server/domain/` | Business rules via ports | `new Adapter()`, knowledge of the provider |
| Ports | `server/ports/` | Dependency interfaces | Implementation |
| Adapters | `server/adapters/` | Supabase, Finik, Telegram, Shopify | Business decisions |
| Composition Root | `server/di/container.ts` | Wiring, rule chains, feature flags | Domain logic |

Also documents per-service "knows / doesn't know" boundaries (e.g. `CheckoutService` knows how to place an order and call pricing/inventory/payment; it does *not* know who is allowed to pay CASH or which status transitions are valid — that's `PaymentPolicyService`/`OrderLifecycleService`'s job) and a delegation rule: *"the orchestrator calls `paymentPolicy.assertCanUsePaymentMethod()` — it does not check the conditions itself."*

**Rationale:** Not separately stated beyond single-responsibility-per-layer.

**Consequences:** This is a review checklist as much as a principle — it directly maps code-review questions ("can this be paid in cash?", "can it move CREATED → PAID?") to the service responsible for answering them.

**Affected modules:** all layers listed in the table above.

**Source:** `docs/principles/13-engineering-roles.md`

---

### PL-14 — Architecture Decision Record

**Description:** Significant architectural decisions are recorded as an **ADR** (`docs/adr/`). An ADR is a required artifact before adopting any decision affecting layer boundaries, provider replaceability, or data flow. Table of when an ADR is required: new external provider → yes; changing the import rule between layers → yes; direct frontend access to DB/API → yes (usually Rejected); refactoring one adapter without changing its port → no; UI cosmetics → no. Format specified (`Status`/`Date`/`Context`/`Problem`/`Decision`/`Consequences`/`Alternatives considered`/`Implementation notes`/`References`). Numbering: `docs/adr/ADR-NNN-kebab-title.md`; `Accepted` means code must conform; superseded ADRs are kept, not deleted. States explicitly: *"Принципы в docs/principles/ не заменяют ADR: принципы — стандарты, ADR — конкретные решения"* ("principles don't replace ADRs: principles are standards, ADRs are concrete decisions").

**Rationale:** Not separately stated beyond traceability of significant decisions.

**Consequences:** Only one ADR exists in the repository (`ADR-001`), despite at least one decision that, by this principle's own criteria, should have produced a second one: the deletion of the ~4,600-file orphaned second composition root (Findings F1/F2/F3/F6 in `ARCHITECTURE_AUDIT.md`) materially affected layer boundaries and was never recorded as an ADR. This is a live, self-identified gap — see §6.

**Affected modules:** `docs/adr/`.

**Source:** `docs/principles/14-architecture-decision-record.md`

---

## §2. Recovered from `docs/adr/ADR-001-ports-and-adapters.md`

### ADR-001 — Ports & Adapters Platform Layer

**Description:** Introduces a Platform Layer between frontend and all external services, structured as: Contracts (`shared/contracts/`) — frontend-safe DTOs; Ports (`server/ports/`) — interfaces for storage, payment, notifications; Adapters (`server/adapters/`) — Supabase, Finik, Telegram, temporary Shopify; Domain services (`server/domain/`) — business rules; Transport (`server/functions/`) — TanStack `createServerFn` handlers; Frontend API (`src/api/`) — sole bridge from React to server functions.

**Rationale (Problem stated):** at the time, the app called Shopify Storefront GraphQL directly from the browser; the Supabase schema existed but was unused; secrets were hardcoded in client code; there was no backend business logic for orders, payments, or notifications.

**Consequences (as stated):**
- *Positive:* frontend replaceable without touching business logic; payment-provider swap = new adapter only; secrets stay server-side; single source-of-truth path to Supabase; testable domain layer via mocked ports.
- *Negative:* more files and indirection during migration; temporary dual catalog (Shopify + Supabase) until Stage 9; TanStack Start requires careful bundle boundaries for `server/`.

**Alternatives considered (as stated):** (A) Direct Supabase from frontend via RLS — *Rejected: exposes data model, couples UI to Postgres schema, prevents server-side caching/validation.* (B) Big-bang rewrite removing Shopify immediately — *Rejected: breaks production storefront during migration.* (C) BFF-only without ports (server functions call Supabase directly) — *Rejected: does not allow swapping Finik/Telegram/Shopify without rewriting handlers.*

**Implementation notes (as stated):** `FEATURE_CATALOG_SOURCE` enables parallel run; `ShopifyCatalogAdapter` is temporary; ESLint enforces import boundaries; `src/integrations/supabase/` remains for auth session only until Stage 4.

**Affected modules:** the entire `server/` tree, `shared/contracts/`, `src/api/`.

**Status:** Accepted, 2026-07-16.

**Source:** `docs/adr/ADR-001-ports-and-adapters.md`

---

## §3. Recovered from `docs/architecture/ARCHITECTURE_POLICY.md`

This document is explicitly scoped ("данный документ не требует и не предполагает изменений в BCM, API, Domain, Infrastructure или базе данных") as a **product/architectural vision policy**, not a description of current implementation — the README independently confirms this class of document describes "будущее развитие платформы... не текущая реализация." Recovered here in full per instruction; status per entry noted where the gap between vision and current code is material.

### POL-01 — Platform Mission

**Description:** «Местный Базар» is conceived not as an ordinary marketplace but as a scalable digital ecosystem for residents of Kyrgyzstan — a single platform for local goods, services, partner programs, and everyday digital services. The marketplace is **the first stage**; it builds the foundation of trust, transactions, logistics, and user base that later capabilities (loyalty, partnerships, additional services) build on top of, not replace.

**Rationale:** Stated as the platform's mission itself.

**Consequences:** Every subsequent policy section in this document derives from this framing (marketplace-as-foundation, not marketplace-as-final-product).

**Affected modules:** whole-system framing; no specific code module.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §1

---

### POL-02 — Staged Platform Evolution

**Description:** Development proceeds in stages: **V1** Marketplace Core (catalog, sellers, orders, payment, delivery, admin); **V2** Loyalty BCM (tiers, bonuses, rewards, cashback, coupons); **V3** Partner Ecosystem (banks, telecom, utility/government services); **V4+** Extended Services. Stated principle: extension points are architected in advance, but implementing a later version never blocks the previous ones.

**Rationale:** Not separately stated beyond enabling incremental delivery without rework.

**Consequences:** As of this recovery, only V1 (Marketplace Core) has any implementation; V2–V4 exist purely as this document's stated intent.

**Affected modules:** whole-system roadmap; no specific code module implements V2+.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §2

---

### POL-03 — Stable Core Principle

**Description:** The Marketplace Core must remain maximally stable. Its core processes — registration, catalog, sellers, search, cart, order, payment, delivery, warehouse, administration — must **not** be rewritten as new capabilities appear. All growth happens **around** the core, not in place of it. New BCMs connect as optional extensions through well-defined contracts (ports, events, Application Layer) without touching the core's internal logic.

**Rationale:** Not separately stated beyond long-term maintainability.

**Consequences:** Any future BCM whose implementation requires modifying core order/checkout/catalog logic (rather than extending it additively) would violate this principle as documented.

**Affected modules:** the entire current Marketplace Core (`server/domain/{checkout,order,catalog,...}`).

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §3

---

### POL-04 — Module Independence

**Description:** Any new Business Capability Module (BCM) must be **fully optional**. If Loyalty, Experience Engine, Rule Engine, Recommendation Engine, Partner Integrations, Gamification, or Live Commerce were disabled, the marketplace must **continue working completely**. Stated as a hard rule: *"ни один дополнительный модуль не имеет права становиться обязательной зависимостью Marketplace Core"* ("no additional module may become a mandatory dependency of the Marketplace Core"). Integration only via domain events, an Application Layer, and optional registration in the Composition Root (DI).

**Rationale:** Not separately stated beyond enabling safe, decoupled extension.

**Consequences:** None of the named BCMs (Loyalty, Experience Engine, Rule Engine-as-BCM, Recommendation Engine, Partner Integrations, Gamification, Live Commerce) exist in the current codebase — this principle is currently unfalsifiable in practice (nothing yet depends on a non-existent module either way).

**Affected modules:** none yet implemented; governs future `server/di/container.ts` registration of BCMs.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §4

---

### POL-05 — Loyalty Architecture (future)

**Description:** A future Loyalty BCM will own exclusively: tiers (Bronze/Silver/Gold/Platinum), bonuses (accrual, spend, expiry), rewards, monthly turnover tracking, partner benefits, cashback, coupons, and personalized offers. All loyalty rules run through the Rule Engine (per POL-06); hardcoded conditions like `if (turnover > 10000)` directly in BCM code are forbidden. Loyalty BCM does not own orders, payment, or catalog — it reacts to core events and serves balance/reward data on request.

**Rationale:** Consistency with POL-03/POL-04 (core stability, module independence).

**Consequences:** Not implemented; purely prospective.

**Affected modules:** none yet.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §5

---

### POL-06 — Rule Engine (future, platform-wide configurable rules)

**Description:** A central mechanism for **configurable** business logic across the platform — rules like "turnover > 10,000 KGS → grant 'Active Buyer' reward," "user's birthday → gift/personal coupon," "Nooruz (March 21) → seasonal promotion," "Gold tier → free delivery from 500 KGS." Requirements stated: rules are created/changed **without code changes**; rules are versioned and have an expiry; rules are tested in an isolated environment before publishing; rules create no direct dependencies between BCMs — only through events and contracts.

**Rationale:** Enable non-engineering (ops/marketing) control of business rules without a deploy cycle.

**Consequences:** Not implemented. This is a **different concept** from the already-implemented, code-level rule engine described in PL-10/PL-12 — that one is a design pattern for structuring authorization/policy code (`order`/`applies`/`evaluate`/`terminal`, changed only by shipping new rule classes); this one is envisioned as an admin-configurable, no-deploy runtime rules system for marketing/loyalty logic. See the duplicate flag under PL-12.

**Affected modules:** none yet.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §6

**⚠ Possible duplicate / naming collision:** PL-10, PL-12 (see cross-reference there).

---

### POL-07 — Experience Engine (future)

**Description:** Owns exclusively the visual and emotional user experience: visual identity (themes, colors, fonts, icons, illustrations), homepage content (banners, promos), animations, onboarding screens, seasonal styling, and UI personalization by tier/achievement/city. Explicitly contains **no** order/payment/loyalty business logic — it receives data from other BCMs (tier, active promotions) and renders the corresponding UI.

**Rationale:** Separation of presentation/content concerns from business logic, consistent with POL-04.

**Consequences:** Not implemented.

**Affected modules:** none yet.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §7

---

### POL-08 — Dynamic Interface (future)

**Description:** The UI should be able to change automatically based on context — without shipping a new app version. Triggers listed: season, weather (e.g. a "hot tea" banner at −15°C), public holidays (Nooruz, Independence Day), city-level events, marketing campaigns, user achievements, customer tier, partner programs. All configured via an admin panel and delivered through the Experience Engine (POL-07) in real time or near-real-time (CDN/push-config).

**Rationale:** Not separately stated beyond agility without redeploying the app.

**Consequences:** Not implemented.

**Affected modules:** none yet.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §8

---

### POL-09 — User Registration as Onboarding Experience

**Description:** Registration is part of the Onboarding Experience. Four stated principles: (1) the registration form must **not** be the first screen — the user sees the platform's value first; (2) registration must motivate, not obstruct — minimal fields, a clear benefit stated ("get 500 bonus points for signing up"); (3) onboarding is a **scenario**, not a single form: welcome screens → capability demo → soft registration prompt → phone confirmation → personalization; (4) onboarding content is managed through the Experience Engine, not hardcoded.

**Rationale:** Maximize registration conversion and perceived product value before asking for commitment.

**Consequences:** The current app's actual registration flow is a direct Google OAuth sign-in button embedded contextually (e.g. on the orders page, cart checkout) with no dedicated welcome/onboarding scenario — this principle's vision is not reflected in current implementation. `ONBOARDING_BOUNDARY.md` (OB-01 below) formalizes which team/module owns this gap.

**Affected modules:** none yet own the described onboarding scenario; current `src/lib/auth.ts` + call sites are the closest existing analog.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §9

---

### POL-10 — Premium Design

**Description:** The interface must feel like a world-class product. Named principles: minimalism (no visual noise), speed (instant responsiveness, skeleton loaders over spinners), "expensive" typography, smooth 60fps purposeful animation, precise spacing/grid, visual cleanliness (consistent colors/shadows/radii), one shared design system (not duplicated per BCM), and emotional trust-building polish.

**Rationale:** Not separately stated beyond product-quality positioning.

**Consequences:** Partially reflected in current code (shadcn/radix component library, Tailwind design tokens, `loading="lazy"` image patterns) but not verifiable against most named criteria (60fps animation budget, skeleton-vs-spinner consistency) without a UI audit, which is out of scope for this recovery.

**Affected modules:** `src/components/ui/`, `src/styles.css`.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §10

---

### POL-11 — Configurability of User-Facing Content

**Description:** From the admin panel, the following must be changeable without a deploy: banners, themes, colors, icons, illustrations, home screens, welcome messages, promotions, marketing campaigns, seasonal/holiday styling. Stated as a hard rule: *"Запрещены жёстко прописанные значения (hardcode) для любого пользовательского контента, который может меняться операционной командой"* ("hardcoded values are forbidden for any user-facing content the ops team might need to change"). Configuration is centrally stored, versioned, and delivered via the Experience Engine.

**Rationale:** Let non-engineering staff operate campaigns/content without engineering involvement.

**Consequences:** Contradicted by current code in the sense that content is not yet configurable this way — e.g. category fallback images and Kyrgyz-language category names are literal hardcoded maps in `src/routes/index.tsx` (`KG_NAME_BY_SLUG`, `FALLBACK_IMAGE_BY_SLUG`), by that same file's own comment acknowledging the images "haven't been uploaded to Supabase Storage yet." This is expected at the current stage (no admin panel or Experience Engine exists yet), not a violation of a principle meant to apply once those systems exist.

**Affected modules:** none yet implement admin-driven configurability; `src/routes/index.tsx` is the concrete current counter-example.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §11

---

### POL-12 — Future Partner Ecosystem

**Description:** The architecture should allow external partners (banks, insurers, utilities, mobile operators, ISPs, courier services, delivery services, government services like Tunduk, and others) to be connected without changing the Marketplace Core. Integration principles: each partner connects through a future Partner Integration BCM; the Marketplace Core never knows about a specific partner, only the contract; disabling a partner never breaks the marketplace; partner data is isolated, exchanged only via events/API contracts.

**Rationale:** Consistent with POL-03/POL-04 (core stability, module independence), extended to third parties.

**Consequences:** Not implemented.

**Affected modules:** none yet.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §12

---

### POL-13 — Architectural Constraints (Forbidden / Allowed)

**Description:** Explicit **forbidden** list: (1) breaking existing BCMs — changes must be additive; breaking changes require an ADR and migration plan; (2) creating tight coupling — direct imports between BCMs are forbidden, only ports and events; (3) adding new dependencies *into* the Marketplace Core — the core must not depend on Loyalty, Experience Engine, Rule Engine, etc.; (4) rewriting working business processes without documented technical necessity; (5) hardcoding business rules — all rules go through the Rule Engine; (6) hardcoding UI content — all content goes through Experience Engine/admin panel; (7) creating new Platform-level modules for vertical scenarios — scenarios live in the Application Layer on top of BCMs. Explicit **allowed** list: adding new optional BCMs; extending the Application Layer; adding new REST routes without changing existing ones; minimal additive BCM changes (new methods, new fields with defaults); writing an ADR.

**Rationale:** Operationalizes POL-03/POL-04/POL-14 into a concrete do/don't checklist.

**Consequences:** Item (3) — the core must not depend on not-yet-existing BCMs — is trivially satisfied today since no such BCMs exist. Item (5)/(6) restate PL-10/PL-12 (code-level rule engine) and POL-06/POL-11 (content configurability) respectively, in enforcement-checklist form.

**Affected modules:** governs all future cross-BCM work; no current module violates it (no BCMs exist to violate it with).

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §13

---

### POL-14 — Extend, Never Replace (the platform's governing principle)

**Description:** Stated as the document's own "main principle": *"Каждая новая возможность должна расширять существующую архитектуру, а не заменять её"* ("every new capability must extend the existing architecture, not replace it"). The system is meant to evolve for decades without a full rewrite. Layering diagram given: Marketplace Core (stable core) ← events/ports ← Application Layer (vertical scenarios) ← optional: Loyalty BCM, Experience Engine, Rule Engine, Partner Integrations, Recommendation Engine, Gamification, Live Commerce.

**Rationale:** Stated directly — long-term system longevity without rewrites.

**Consequences:** This is the umbrella principle POL-01 through POL-13 all serve; nothing in current code contradicts it, but nothing yet tests it either, since no BCM has been built on top of the core to prove the extension model works in practice.

**Affected modules:** whole-system.

**Source:** `docs/architecture/ARCHITECTURE_POLICY.md` §14

---

## §4. Recovered from `docs/architecture/ONBOARDING_BOUNDARY.md`

### OB-01 — Onboarding / Customer Management Boundary

**Description:** Defines a responsibility boundary: everything **before** registration (welcome screens, app tours, value demonstration, registration motivation, seasonal onboarding styling, first-screen A/B tests) belongs to the Experience Engine and a future Onboarding Module — **not** Customer Management. Everything **from** account creation onward (`POST /api/customers/register` and later: phone verification, profile create/update, address/notification/order-history management, deactivation) belongs to Customer Management (Application Layer + Customer BCM). States explicitly this is Stage 89.1, with no REST API or behavior changes implied by the document itself.

**Rationale:** Not separately stated beyond drawing a clean ownership line between two not-yet-fully-built subsystems.

**Consequences:** Named use cases (`RegisterCustomerUseCase`, `VerifyPhoneUseCase`, `CreateCustomerProfileUseCase`, `UpdateCustomerProfileUseCase`, `DeactivateCustomerUseCase`) do not exist as named classes anywhere in the current `server/` tree — current registration is handled entirely by Supabase Auth (Google OAuth) with no custom `RegisterCustomerUseCase`-shaped code. This document describes a **boundary for a subsystem that has not been built yet** (references "Stage 89" and "Application Layer + Customer BCM," neither of which exist in the current codebase, which is still within its original ~10-stage Ports & Adapters migration).

**Affected modules:** none currently implement the named use cases; `src/lib/auth.ts`, `server/auth/resolve-user.ts` are the closest current analogs (plain Supabase Auth, not a Customer BCM).

**Source:** `docs/architecture/ONBOARDING_BOUNDARY.md`

---

## §5. Recovered from code patterns (no dedicated document found)

Every entry in this section is marked **PARTIALLY RECOVERED**: each is reconstructed from a repeated pattern across multiple independent files plus inline comments, but no single document states the principle, its full rationale, or its boundaries the way §1–§4's sources do. The "Rationale" given is synthesized from the clearest available comment(s), not quoted from a dedicated write-up.

---

### CD-01 — PARTIALLY RECOVERED — Never Trust Client-Supplied Business Data

**Description:** Any business-critical value a client sends (a price, an elapsed time, a "this is still valid" claim) is re-derived from the server's own source of truth before being acted on, never taken at face value.

**Rationale (reconstructed):** `checkout.service.ts`'s `resolveLineItems()` always re-fetches product price/stock/name from `IProductRepository`, explicitly ignoring the client-sent `snapshot.price`. `customer-cancel-order.rule.ts` computes the cancellation window from `order.createdAt` (DB) and the server's own clock, with an inline comment: *"Never trust a client-supplied elapsed time."* `CartService.validate()` reports `price_changed` by comparing the client's snapshot against `IProductRepository`'s own answer, never the reverse.

**Consequences:** Any new feature accepting a price, quantity-derived total, or time-based eligibility claim from the client should re-derive it server-side rather than validate-and-trust the client's number.

**Affected modules:** `server/domain/checkout.service.ts`, `server/domain/cart.service.ts`, `server/domain/order-lifecycle/rules/customer-cancel-order.rule.ts`.

**Source:** reconstructed from repeated pattern; no dedicated document found.

---

### CD-02 — PARTIALLY RECOVERED — Atomic RPC Functions for TOCTOU-Sensitive Operations

**Description:** Any read-then-write operation where two concurrent requests could both pass a check before either writes (a classic check-then-act race) is implemented as a single atomic Postgres function (`CREATE OR REPLACE FUNCTION ... LANGUAGE plpgsql`), not as separate SELECT-then-UPDATE calls from application code.

**Rationale (reconstructed, quoted from migration comments):** `reserve_product_stock`/`release_product_stock` (`20260725010000_atomic_stock_reservation.sql`): *"Checkout never actually decremented products.stock... two concurrent orders could both 'pass' a stock check for the last unit (TOCTOU race)."* `set_default_address` (`20260725080000_atomic_default_address.sql`): *"a plain 'clear others, then UPDATE this row' from application code is a real race between two concurrent 'set as default' requests."* `upsert_cart_items` (`20260731180000_platform_cart.sql`): *"a plain SELECT-then-INSERT/UPDATE from application code would race two concurrent adds of the same product into the same quantity bump, the same TOCTOU class already fixed for stock reservation... and default-address selection."*

**Consequences:** This is a named, self-referential pattern — each new migration's comment explicitly cites the earlier ones as precedent, indicating the team treats this as an established convention even though no `docs/principles/` entry names it.

**Affected modules:** `supabase/migrations/20260725010000_atomic_stock_reservation.sql`, `20260725080000_atomic_default_address.sql`, `20260725050000_atomic_order_creation.sql`, `20260731180000_platform_cart.sql`.

**Source:** reconstructed from repeated migration-comment pattern; no dedicated document found.

---

### CD-03 — PARTIALLY RECOVERED — Optimistic Concurrency Control on State Transitions

**Description:** State-transition writes (order status changes) are conditioned on the row's current value still matching what was read (`UPDATE ... WHERE id = ? AND status = ?`), and a mismatch throws a distinct, named error rather than silently overwriting a concurrent change.

**Rationale (quoted from the port's own doc comment):** `IOrderRepository.updateStatus`'s JSDoc: *"Optimistic concurrency: only applies the transition if the row's current status still matches fromStatus at write time. Throws OrderConcurrentModificationError if another action already changed it — callers read a status, decide a transition is allowed based on that read, then write; two concurrent actions racing that check-then-act window must not both succeed (e.g. two couriers accepting the same order)."*

**Consequences:** This is independently corroborated as a live, tested concern by `docs/manual-test-scenarios.md` item 2 ("Одновременно из двух вкладок попытаться перевести один и тот же заказ в разные статусы... Ожидается: ровно одно из двух действий проходит").

**Affected modules:** `server/ports/order.repository.ts`, `server/adapters/supabase/order.repository.ts`, `server/domain/order.service.ts`, `server/domain/admin-order.service.ts`, `server/domain/warehouse-order.service.ts`, `server/domain/courier-order.service.ts`.

**Source:** reconstructed from `IOrderRepository.updateStatus` doc comment + `docs/manual-test-scenarios.md`; not named in `docs/principles/`.

---

### CD-04 — PARTIALLY RECOVERED — Best-Effort Compensation Must Not Undo or Block a Durable Primary Action

**Description:** When an operation has already durably succeeded (an order is cancelled, stock was reserved and now must be released) and a *secondary*, compensating step fails, that failure is logged, not thrown — the primary result stands, and the customer-facing operation is not retried, rolled back, or reported as failed because of it.

**Rationale (reconstructed, quoted from code comments):** `checkout.service.ts`, on releasing stock after a failed order creation: *"a stock-release hiccup here shouldn't undo that or fail the request."* `order.service.ts`'s `cancelOrder`, releasing stock after a successful cancellation: *"The order is already cancelled (durable, customer-visible) at this point — a stock-release hiccup must not undo that or fail the request. Same acceptable-narrow-window tradeoff CheckoutService already makes."*

**Consequences:** This tradeoff is explicitly accepted as leaving a **narrow, documented inconsistency window** (stock could under-count if the compensating release fails) rather than blocking the user-facing action — a deliberate choice, not an oversight, in both places it appears.

**Affected modules:** `server/domain/checkout.service.ts`, `server/domain/order.service.ts`.

**Source:** reconstructed from repeated code-comment pattern; no dedicated document found.

---

### CD-05 — PARTIALLY RECOVERED — Policy Results Carry a Machine-Readable Denial Code

**Description:** A policy/rule evaluation never returns a bare boolean. It returns `{ allowed: boolean; denialCode?: string; message?: string }`, and the asserting variant throws a typed error (`OrderLifecycleDeniedError`, carrying `.code`) rather than a generic one.

**Rationale (reconstructed):** Named denial codes appear consistently across every rule file (`AUTHENTICATION_REQUIRED`, `ADMIN_ROLE_REQUIRED`, `ORDER_ALREADY_IN_PROGRESS`, `CANCELLATION_WINDOW_EXPIRED`, `INVALID_CONFIRM_TRANSITION`, etc.) and PL-12's own documented algorithm names two fallback codes (`NO_MATCHING_RULE`, `UNKNOWN_*`) — the convention is implied by PL-12 but the *reason* for using a code rather than just a message is not written down anywhere.

**Consequences:** This is what lets a frontend (e.g. `src/routes/orders/$id.tsx`'s `formatCancelError`) map specific denial reasons to distinct user-facing messages instead of showing a raw server error string.

**Affected modules:** `server/ports/{order-lifecycle,payment-policy,product-publication}.port.ts`, all `server/domain/*/rules/*.rule.ts`, `server/domain/order-lifecycle/order-lifecycle.errors.ts`.

**Source:** reconstructed from repeated pattern across every rule module; the mechanism is implied but not separately justified in `docs/principles/12-rule-engine-standard.md`.

---

### CD-06 — PARTIALLY RECOVERED — DB-Row-to-DTO Mapping Lives in Small, Independently Tested Pure Functions

**Description:** The translation from a Supabase row shape to a `shared/contracts/` DTO is factored into a standalone, exported, pure function (not inlined in the repository method), and that function gets its own unit test separate from any test that would require a real database.

**Rationale (reconstructed):** Concretely evidenced by `order.mapper.ts`'s `mapOrderRowToDto`/`toDbOrderStatus`/`fromDbOrderStatus` (tested in `order.mapper.test.ts`), `cart.repository.ts`'s `mapCartItemRow` (tested in `cart.repository.test.ts`), and `address.repository.ts`'s local `mapRow`. This is presented as the concrete mechanism behind PL-04 (DTO Contracts) and PL-08 (Storage as Implementation Detail), but neither document names "extract a pure mapper function and test it in isolation" as its own rule — that's an implementation choice this recovery infers from the pattern, not a documented mandate.

**Consequences:** New adapters should follow the same shape (exported pure mapper + accompanying `.test.ts`) to stay consistent, though nothing enforces this beyond convention.

**Affected modules:** `server/adapters/supabase/order.mapper.ts`, `server/adapters/supabase/cart.repository.ts`, `server/adapters/supabase/address.repository.ts`.

**Source:** reconstructed from repeated pattern; no dedicated document found.

---

### CD-07 — PARTIALLY RECOVERED — Guests Are a First-Class Path Through Checkout, Address, and Cart

**Description:** An unauthenticated ("guest") user can complete checkout using a free-text address snapshot instead of a saved address, and the cart's validation path has no authentication requirement at all. `resolveUserIdFromRequest()` returns `null` rather than throwing when there is no valid JWT, and callers are expected to handle that `null` as a legitimate case, not an error.

**Rationale (quoted from a migration comment):** `20260716100000_guest_checkout_nullable_user.sql`: *"Allow guest (unauthenticated) ONLINE checkout: orders may have no user_id."* Also documented in `resolveUserIdFromRequest`'s own doc comment: *"Returns null for guests (no header or invalid token) — used for ONLINE checkout."*

**Consequences:** Every new customer-facing capability needs an explicit decision about whether it supports guests (like checkout and cart validation) or requires auth (like the persisted server cart, order history, or cancellation) — this is a real fork every new feature in this codebase has had to make, but the *rule* for which side a feature should default to is not written down.

**Affected modules:** `server/domain/checkout.service.ts`, `server/domain/cart.service.ts`, `server/auth/resolve-user.ts`, `supabase/migrations/20260716100000_guest_checkout_nullable_user.sql`.

**Source:** reconstructed from migration comment + `resolveUserIdFromRequest` doc comment; no dedicated document found.

---

### CD-08 — PARTIALLY RECOVERED — Server-Only Modules Are Named So Tooling Can Catch Client Leakage

**Description:** A module that must never be bundled into the client is named `*.server.ts` (or marked via `@tanstack/react-start/server-only`), rather than relying solely on import-boundary linting to catch a mistake.

**Rationale (quoted from `eslint.config.js`):** the `no-restricted-imports` rule for the literal `server-only` package includes the message: *"TanStack Start does not use the Next.js server-only package. Rename the module to *.server.ts or mark it with @tanstack/react-start/server-only."*

**Consequences:** This is a narrower, TanStack-Start-specific instance of PL-07 (Server-Only Secrets)/PL-01 (Platform Layer), surfaced only in ESLint config text, not in any principles document. `src/integrations/supabase/client.server.ts` is the concrete example.

**Affected modules:** `eslint.config.js`, `src/integrations/supabase/client.server.ts`.

**Source:** reconstructed from `eslint.config.js` rule message; no dedicated document found.

---

### CD-09 — PARTIALLY RECOVERED — Tests Never Depend on a Live External Service

**Description:** The unit test suite (`vitest.config.ts`, scoped to `server/**/*.test.ts` and `shared/**/*.test.ts`) runs against fake/in-memory port implementations exclusively — no test opens a real Supabase connection, and CI is documented as not requiring any secrets.

**Rationale (quoted):** `vitest.config.ts`'s own comment: *"Deliberately separate from vite.config.ts: the app's Vite config pulls in TanStack Start's SSR/build plugins... that have no place in a unit-test runner."* `README.md`'s CI section: *"Секреты не требуются — сборка и тесты не обращаются к реальному Supabase"* ("no secrets required — the build and tests never touch real Supabase").

**Consequences:** Every `*.test.ts` file in the repo follows a `fake<PortName>(overrides)` factory-function convention (e.g. `fakeOrderRepository`, `fakeProductRepository`, `fakeEventBus`) rather than mocking at the network layer — consistent across dozens of files, but the convention itself (factory-function-per-port, not a mocking library) is not documented anywhere as a rule.

**Affected modules:** `vitest.config.ts`, every `server/**/*.test.ts` and `shared/**/*.test.ts` file.

**Source:** reconstructed from `vitest.config.ts` comment + README + universal test-file pattern; no dedicated document found.

---

### CD-10 — PARTIALLY RECOVERED — Batch Repository Lookups Instead of Per-Item Round Trips on Hot Paths

**Description:** When resolving N items against a repository (cart lines, order line items), the code issues a small constant number of batched queries (`getManyByIds`/`getManyBySlugs`), not one query per item in a loop.

**Rationale (quoted from code comments):** `checkout.service.ts`'s `resolveLineItems`: *"Batches product lookups into at most two queries (by id, by slug) instead of one round trip per cart line — resolveProduct() used to call getById/getBySlug inside a per-item loop, an N+1 on checkout's hottest path."* `cart.service.ts`'s `lookupProducts` follows the identical two-query (ids/slugs) shape.

**Consequences:** This is presented in the checkout comment as a **fix for a prior regression** (an N+1 that existed and was removed), not a rule stated in advance — meaning this is recovered evidence of a past incident/decision, not a preemptively documented standard.

**Affected modules:** `server/domain/checkout.service.ts`, `server/domain/cart.service.ts`, `server/ports/product.repository.ts` (`getManyByIds`/`getManyBySlugs`).

**Source:** reconstructed from repeated code-comment pattern; no dedicated document found.

---

### CD-11 — PARTIALLY RECOVERED — Idempotent Handling of State-Creating Requests

**Description:** An operation that creates durable state and could plausibly be retried by the client (a double-tap "place order" click, a network retry) accepts a client-supplied idempotency key and short-circuits to the existing result if that key was already used, checked *before* any side effect (before stock reservation, before insert).

**Rationale (reconstructed):** `CreateOrderRequest.idempotencyKey` is required (`shared/validation/order.schema.ts`); `CheckoutService.checkout()`'s first substantive line is `getOrderByIdempotencyKey`, with an inline comment: *"A retried request with the same idempotencyKey must not reserve stock a second time for an order that already exists — short-circuit before touching inventory."* The same file also documents the residual gap honestly: *"the idempotency short-circuit above and this reservation are not one atomic transaction, so two requests with the same key racing past it simultaneously could both reserve stock... an accepted, narrow-window residual."*

**Consequences:** The pattern is applied to order creation only; `CartService`'s add/merge operations do not use an idempotency key (they rely on CD-02's atomic upsert-by-identity instead) — evidence this principle is scoped specifically to *creating a new durable entity*, not to every mutating request.

**Affected modules:** `server/domain/checkout.service.ts`, `shared/validation/order.schema.ts`, `supabase/migrations/20260725000000_orders_idempotency_key.sql`.

**Source:** reconstructed from code comments in `checkout.service.ts`; no dedicated document found.

---

## §6. Summary

### 1. Total recovered principles: **41**

| Group | Count | Status |
|---|---|---|
| §1 `docs/principles/` (PL-01…PL-14) | 14 | FULLY RECOVERED |
| §2 ADR (ADR-001) | 1 | FULLY RECOVERED |
| §3 `ARCHITECTURE_POLICY.md` (POL-01…POL-14) | 14 | FULLY RECOVERED (vision-status, not implementation-status) |
| §4 `ONBOARDING_BOUNDARY.md` (OB-01) | 1 | FULLY RECOVERED (describes a not-yet-built subsystem) |
| §5 code-derived (CD-01…CD-11) | 11 | **PARTIALLY RECOVERED** (all 11) |
| **Total** | **41** | — |

### 2. Partially recovered principles

All 11 entries in §5 (`CD-01` through `CD-11`) are marked **PARTIALLY RECOVERED** — each is reconstructed from a repeated multi-file code/comment pattern rather than transcribed from a single authoritative document, so their stated "Rationale" is this recovery's best synthesis, not a verbatim quote of a design decision.

No entry in §1–§4 is marked partially recovered — each source document was complete and unambiguous in itself, even where its *content* is now stale (PL-10, PL-11) or describes a not-yet-built system (all of §3, OB-01).

### 3. Duplicate candidates

- **PL-10 (Policy Rule Engines) vs. PL-12 (Rule Engine Standard):** two separate documents describing the same `order`/`applies`/`evaluate`/`terminal` mechanism, the same module structure, and overlapping tables of implemented policies. Not merged, per instruction — both kept as-is.
- **PL-12 / PL-10 ("Rule Engine," code-level, implemented) vs. POL-06 ("Rule Engine," ARCHITECTURE_POLICY.md, admin-configurable platform-wide rules, not implemented):** identical name, materially different scope and status. Flagged as a naming collision rather than a content duplicate — kept as three distinct entries.

### 4. Missing principles that likely existed but cannot be reconstructed

- **Principles governing the deleted orphan "enterprise platform" tree.** `ARCHITECTURE_AUDIT.md` (Findings F1, F2, F3, F6) documents that this repository, before this branch's cleanup, contained ~4,600 files under `server/application`, `server/infrastructure`, `server/platform`, `server/bootstrap`, `server/observability`, `server/security`, `server/jobs`, `server/transports` — a second, unreachable composition root and domain model, including 87 `ai-*-registry` modules and a duplicate DDD order/catalog/product/seller model (124 files). Something must have guided that design (naming conventions, layering intent, an AI-platform vision), but it was never captured in `docs/principles/`, `docs/adr/`, or any comment surviving in the current tree — the code itself has since been deleted per the audit's resolution. **Unrecoverable beyond the directory/file inventory already preserved in `ARCHITECTURE_AUDIT.md` itself.**
- **An ADR for the orphan-tree deletion.** By PL-14's own stated criteria ("changing the import rule between layers," "direct frontend access to DB/API," and by extension any decision "affecting layer boundaries... or data flow" at this scale), deleting ~4,600 files and a duplicate composition root should have produced an ADR. `ARCHITECTURE_AUDIT_RESOLUTION.md` records the *what* and *why* of that deletion in narrative form, but no `docs/adr/ADR-002-*.md` was ever created — the decision exists in an audit report, not in the ADR trail PL-14 itself mandates.
- **A formal testing-strategy principle.** CD-09 (test isolation) and the broader "every service ships with a matching `*.test.ts`" convention (evidenced by ~46 test files consistently following the same `fake<Port>()` shape) are strong, consistent practices with no corresponding `docs/principles/15-testing-strategy.md` — the numbering stops at 14, and nothing in `PROJECT_STANDARDS.md` claims a 15th principle exists. Whether this was a deliberate omission or a principle that was practiced but never written down cannot be determined from the repository alone.
- **A security/RLS principles document.** RLS ownership policies (`auth.uid() = user_id`) are applied consistently across every table with per-user data (`addresses`, `carts`, `cart_items`, `orders` admin policies, etc.), and the README's "Known Limitations" section explicitly flags rate limiting as unimplemented — but no `docs/principles/*` entry or ADR addresses security posture, RLS conventions, or the service-role-bypasses-RLS trust boundary as a named principle the way PL-07/PL-08 cover secrets and storage. Given the consistency of the RLS pattern across ~10+ migrations, a principle likely existed in intent; its text cannot be reconstructed beyond "ownership predicate on every per-user table," which this document already captures piecemeal inside CD-02/CD-07 rather than as its own entry.
- **Payment (Finik) and Notifications (Telegram/WhatsApp) integration-specific principles.** ADR-001 and PL-09 establish that these are swappable adapters, but neither document (nor any other found) states integration-specific rules — webhook signature verification strategy, retry/backoff semantics, idempotency for payment callbacks. `server/adapters/payment/finik.adapter.ts` and the Telegram/WhatsApp adapters are hard stubs (`throw new Error("not implemented (Stage 7/8)")`), so no implementation exists yet to reconstruct such a principle from either.

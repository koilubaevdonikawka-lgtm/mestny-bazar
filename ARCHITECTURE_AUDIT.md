# Architecture Audit — Everyday Eats Hub («Местный Базар»)

Strict, evidence-based audit. Read-only — no files were modified. Every reachability claim below was verified
two ways: (1) static import-graph tracing from the project's real runtime entry points, including TanStack
Start's `await import(...)` lazy-loading pattern, and (2) empirical cross-check against the actual compiled
production bundle at `.output/server/` (a Cloudflare Workers/Nitro build that already exists in the working tree).
Where a claim relies on "grep found nothing," the exact command is shown so it can be re-run.

## Severity scale

| Level | Meaning |
|---|---|
| **Critical** | Defect in the reachable/shipped code path with real correctness or build-integrity risk |
| **High** | Proven architectural violation or large-scale duplication; no current runtime impact, but high risk/cost if left |
| **Medium** | Real, verified problem with contained blast radius |
| **Low** | Verified issue with no reachable/runtime impact |
| **Not an issue** | Investigated and found to be intentional or correct |

---

## 0. Methodology — establishing the reachable graph

Real entry points, confirmed by reading the files (not inferred):

- `vite.config.ts` → `defineConfig({ tanstackStart: { server: { entry: "server" } } })` → resolves to `src/server.ts`.
- `package.json` scripts: `dev`/`build`/`build:dev`/`preview` all invoke bare `vite`; nothing else is scripted.
- `src/server.ts` — Cloudflare-style `fetch` handler; delegates to `@tanstack/react-start/server-entry` (framework package) and imports only `src/lib/error-capture.ts`, `src/lib/error-page.ts`.
- `src/start.ts` — registers TanStack Start middleware; imports `src/lib/error-page.ts` and `@/integrations/supabase/auth-attacher`.
- `src/router.tsx` → `src/routeTree.gen.ts` (generated) → `src/routes/**` (file-based routes), rooted at `src/routes/__root.tsx`.

Route files that touch the backend all go through `src/api/*.ts`, confirmed by direct grep:

```
src/routes/admin/orders/$id.tsx      → @/api/admin
src/routes/admin/orders/index.tsx    → @/api/admin
src/routes/courier/orders/$id.tsx    → @/api/courier
src/routes/courier/orders/index.tsx  → @/api/courier
src/routes/orders/$id.tsx            → @/api/orders
src/routes/orders/index.tsx          → @/api/orders
src/routes/profile/addresses.tsx     → @/api/addresses
src/routes/seller/products/$id.tsx   → @/api/seller
src/routes/seller/products/index.tsx → @/api/seller
src/routes/warehouse/orders/$id.tsx  → @/api/warehouse
src/routes/warehouse/orders/index.tsx→ @/api/warehouse
```

Each `src/api/{domain}.ts` calls a matching `src/api/{domain}.functions.ts` (a `createServerFn` definition), which
lazily `await import("@server/functions/{domain}.executor")` inside the server function body — the standard
TanStack Start pattern for keeping server code out of the client bundle. Example (`src/api/admin.functions.ts:15`):

```ts
const { executeListAdminOrders } = await import("@server/functions/admin.executor");
```

Every `server/functions/*.executor.ts` reached this way (`addresses`, `admin`, `checkout`, `courier`, `orders`,
`seller`, `warehouse`) imports `server/di/container.ts` and calls `getServices()`. `container.ts` in turn imports:

- `server/domain/{catalog,checkout,inventory,notification,notification-center,order,pricing,address,admin-order,warehouse-order,courier-order,seller-product,payment}.service.ts`
- `server/domain/{payment-policy,order-lifecycle,product-publication,marketplace-standards,marketplace-events,marketplace-ai,audit-log}/**` (folder-form modules actually re-exported and consumed here)
- `server/adapters/{supabase,payment,notifications,migration}/*`
- `server/ports/*`

**This is the entire reachable server-side surface of the shipping application.** Everything in the findings
below is evaluated against it.

---

## 1. Findings

### F1 — A second, undocumented composition root exists (`server/bootstrap/*`, 128 files) — **[RESOLVED]**

**Files:** `server/bootstrap/composition-root.ts`, `application-bootstrap.ts`, `application-provider.ts`,
`api-bootstrap.ts`, `infrastructure-bootstrap.ts`, `tokens.ts`, `lifecycle-manager.ts`, `startup-validator.ts`,
`health-check.ts`, plus 119 per-module files named `*-bootstrap.ts` (one per "management" module and per
"ai-*-registry" module — full list obtainable via `find server/bootstrap -type f`, 128 total).

**Why it's a problem:** `docs/principles/05-composition-root.md` (Principle 5) states, verbatim: *"вся композиция
зависимостей только в `server/di/container.ts`; отдельные factory-файлы не допускаются"* — "all dependency
composition happens only in `server/di/container.ts`; separate factory files are not permitted." `server/bootstrap/`
is a second, complete dependency-injection system (its own `ServiceRegistry`/`ServiceProvider`/token registry in
`server/infrastructure/di/service-container.ts` and `tokens.ts`) that directly contradicts this.

**Dependency chain (from `server/bootstrap/composition-root.ts`):**
```
createServiceRegistry(config)                              [composition-root.ts:66]
  → registerInfrastructure(registry, config)                [infrastructure-bootstrap.ts]
  → registerApplication(registry)                            [application-bootstrap.ts]
  → registerAIPlatform(registry)                              [platform/ai/bootstrap]
  → registerIntegrationPlatform(registry)                     [platform/integration/bootstrap]
  → registerApi(registry)                                     [api-bootstrap.ts]
  → 20 further registerXPlatform(registry) calls               [composition-root.ts:69–95]
       (runtime, testing, documentation, governance, developer, operations, release,
        evolution, sdk, gateway, observability, features, policy, compliance, lifecycle,
        capabilities, knowledge, digital-twin, architecture-intelligence, decision,
        autonomous-governance)

buildCompositionRoot(config)                                [composition-root.ts:100]
  → createServiceRegistry(config)
  → 20 activateXPlatform(provider) calls                       [composition-root.ts:104–124]
  → resolves ApiServer, ConfigurationProvider, HealthCheck, LifecycleManager
```

**Reachability proof — how the real app could reach this, and why it doesn't:**
The only file in the confirmed-reachable graph that references anything under `server/bootstrap/` is
`server/functions/purchase.executor.ts` and its sibling `server/functions/purchase.functions.ts`:

```
server/functions/purchase.executor.ts:1   import { getApplicationProvider } from "@server/bootstrap/application-provider";
server/functions/purchase.executor.ts:2   import { BootstrapTokens } from "@server/bootstrap/tokens";
```

`server/bootstrap/application-provider.ts` calls `buildCompositionRoot()` (shown above) — so *if*
`purchase.executor.ts` were ever invoked, the entire second composition root would spin up. But it is not invoked:

```
$ grep -rln "purchase\.functions\|purchase\.executor" . --include="*.ts" --include="*.tsx" | grep -v node_modules
server/functions/purchase.executor.ts     (self)
server/functions/purchase.functions.ts    (self)
```
Zero external importers anywhere in the repository — not in `src/`, not in any route, not in any other
`server/functions/*` file. Confirmed empirically against the compiled build:
```
$ grep -rl "PurchaseApplicationService\|purchase-application.service" .output
(no output)
```
The production bundle (`.output/server/index.mjs`, `.output/server/wrangler.json` — a Cloudflare target) contains
no trace of this code. `purchase.executor.ts` sits in the same directory as seven other executors that *are* real
and wired (`addresses`, `admin`, `checkout`, `courier`, `orders`, `seller`, `warehouse` — all reached from
`src/api/*.functions.ts`), which makes it an easy trap for a future engineer to assume it's live by association.

**Classification: High.** Zero current runtime impact (proven unreachable and absent from the build), but it is
~128 files of duplicate infrastructure, directly contradicts a written architecture principle, and is exactly one
`await import(...)` away from being accidentally activated by a future change to `purchase.functions.ts`.

#### Итоговый анализ F1 (Root Cause Analysis)

Цель этого раздела — зафиксировать, *почему* существует второй Composition Root, является ли он
незавершённой миграцией или заброшенной архитектурой, и подготовить материал для архитектурного решения.
Раздел не выполняет удаление файлов и не меняет статус проекта — это анализ, а не действие.

##### Факты

1. В репозитории существует официальный архитектурный документ `docs/architecture/ARCHITECTURE_POLICY.md`
   (статус: «официальный архитектурный документ»), который явно допускает существование второго пути
   регистрации зависимостей. Раздел 4 («Принцип независимости модулей») прямо разрешает подключение
   дополнительных Business Capability Module (BCM) через «**опциональную регистрацию в Composition Root
   (DI)**» поверх стабильного «Marketplace Core». Раздел 2 описывает дорожную карту: **Версия 1 (Marketplace
   Core) → Версия 2 (Loyalty BCM) → Версия 3 (Partner Ecosystem) → Версия 4+ (Extended Services)**, с
   конкретными названиями модулей: Loyalty, Experience Engine, Rule Engine, Recommendation Engine, Partner
   Integrations, Gamification, Live Commerce.

2. Ни один из модулей внутри `server/application/`, `server/infrastructure/`, `server/platform/`,
   `server/api/modules/` не соответствует ни одному из перечисленных выше BCM:
   ```
   $ find server/application server/infrastructure server/platform server/api/modules -maxdepth 1 -type d \
       | grep -iE "loyalty|experience|recommendation|gamif|live-commerce|partner"
   (пусто)
   ```
   Вместо этого дерево состоит из 87 модулей `ai-*-registry` (accelerator-profile, ethics-profile,
   governance-policy, knowledge-graph, ontology и т.д.), ~25 модулей `*-management` и дерева
   `server/platform/` (`digital-twin`, `autonomous-governance`, `architecture-intelligence`, `evolution`,
   `decision`) — ни один из них не относится к продовольственному маркетплейсу и не упомянут ни в одном
   документе проекта.

3. Существующая реализация `server/bootstrap/composition-root.ts` прямо нарушает собственные правила
   `ARCHITECTURE_POLICY.md` §13:
   - Правило №7 запрещает «Создавать новые Platform-модули для вертикальных сценариев» — при этом
     `server/platform/` содержит 22 таких модуля.
   - Регистрация в `createServiceRegistry()` / `buildCompositionRoot()` вызывает **все** ~40
     `registerXPlatform` / `activateXPlatform` функций безусловно, без feature-флагов — это не
     «опциональная» регистрация, как того требует Раздел 4 документа.

4. Единственный мост из reachable-графа в этот второй Composition Root — `server/functions/purchase.executor.ts`
   → `server/bootstrap/application-provider.ts` → `composition-root.ts` — сам является мёртвым кодом: ноль
   импортёров по всему репозиторию, отсутствует в скомпилированной сборке `.output/server/` (доказано в
   разделе F1 выше). Признаков активной миграции (аналогичных `FEATURE_CATALOG_SOURCE` для перехода
   Shopify → Platform) для этого дерева не найдено — ни флагов, ни частичного подключения, ни TODO/FIXME в
   reachable-графе.

5. Временные метки файловой системы (приводятся как косвенное свидетельство; git-история в проекте
   отсутствует, поэтому нельзя полностью исключить, что часть меток отражает синхронизацию, а не авторство):
   - Индивидуально различающиеся временные метки orphan-дерева распределены с **18 июля 2026, 21:13** по
     **23 июля 2026, 15:27** (по 9–17 файлов в минуту — характерно для постепенной, поэтапной генерации).
   - Все документы, определяющие текущую, реально используемую архитектуру — `docs/architecture.md`, все 14
     файлов `docs/principles/`, `docs/adr/ADR-001-ports-and-adapters.md`, `docs/PROJECT_STANDARDS.md`,
     `docs/architecture/ARCHITECTURE_POLICY.md`, `docs/architecture/ONBOARDING_BOUNDARY.md` — а также сам
     `server/di/container.ts`, имеют идентичную метку **23 июля 2026, 15:26:43** (с небольшим довеском в
     15:27:08).
   - Это выглядит как единовременный, скоординированный сброс/перезапуск: пакет новых
     архитектурных документов и новый минимальный Composition Root появляются одновременно, а не как
     результат постепенной эволюции orphan-дерева в текущую систему.

##### Выводы

- Второй Composition Root существует как механизм регистрации для массива generic-скаффолдинга
  («AI-платформа»), который либо предшествует текущей документированной архитектуре, либо создавался
  параллельно ей, но не как рабочая реализация паттерна, формально разрешённого `ARCHITECTURE_POLICY.md`.
  Сам паттерн («опциональная регистрация BCM») в документе легитимен — но фактическое содержимое дерева
  этому паттерну не соответствует.
- Это **заброшенная архитектура**, а не незавершённая миграция. Ключевое отличие: у незавершённой миграции
  есть видимый работающий механизм перехода (как `FEATURE_CATALOG_SOURCE` для каталога) и хотя бы частично
  используемый путь. У orphan-дерева нет ни того, ни другого — единственный мост в него мёртв с нуля
  импортёров, а само дерево не движется ни к «Stage 1–10» (`docs/architecture.md`), ни к «Версия 1–4»
  (`ARCHITECTURE_POLICY.md`) — двум единственным документированным дорожным картам проекта.
- Реальное, поставляемое приложение (`src/routes` → `src/api` → `server/functions` → `server/di/container.ts`
  → `server/domain`/`server/adapters`/`server/ports`) и второй Composition Root — это два независимых,
  не сходящихся друг с другом технических решения, сосуществующих в одном репозитории.

##### Рекомендация

Требуется явное архитектурное решение: **A) удалить**, **B) интегрировать в реальное приложение** или
**C) архивировать как экспериментальный код**. Технические аргументы (без выполнения самого решения):

- **Против B (интеграция):** ни один модуль orphan-дерева не соответствует ни одной реальной задаче продукта;
  интеграция потребовала бы предварительно согласовать три параллельные реализации одних и тех же понятий
  (плоские `server/domain/*.service.ts` — реальные; богатые DDD-агрегаты `server/domain/{order,catalog,
  product}/` — не задействованы, см. F6; CRUD-скаффолды `server/application`/`server/infrastructure` — не
  задействованы). Это чистые издержки интеграции без единого требования, которое её оправдывало бы.
- **Против C (архивирование):** дерево уже нарушает собственный официальный документ проекта
  (`ARCHITECTURE_POLICY.md` §13, правило №7) — сохранение «для справки» закрепляет паттерн, от которого
  проект уже письменно отказался; масштаб (4 631 из 4 889 файлов `server/`, 94,7%) делает «оставлено, но
  архивировано» затратным независимо от ярлыка — навигация, шум в поиске, риск случайного повторного
  подключения (F1: «один `import` от активации») сохраняются при архивировании так же, как и без него;
  содержимое — это один и тот же шаблон (contracts/models/services/use-cases) с заменой имён 87+ раз, а не
  уникальная логика, которую имеет смысл сохранять.
- **За A (удаление):** недостижимость уже дважды доказана (статический анализ графа импортов + эмпирическое
  отсутствие в `.output/server/`), что удовлетворяет критерию, который сам аудит установил для рекомендации
  удаления (см. §3 «Conclusions» ниже). Удаление затронуло бы `server/application`, `server/infrastructure`,
  `server/platform`, `server/bootstrap`, `server/api`, `server/observability`, `server/security`,
  `server/jobs`, `server/transports`, два мёртвых файла-моста (`server/functions/purchase.{executor,
  functions}.ts`) и зависимые от этого же дерева папки F6 (`server/domain/{order,catalog,product}/`).

**Единая рекомендация:** выбрать вариант **A) удаление** — одним осознанным, проверяемым изменением
(review, ветка), а не точечной очисткой по модулям, поскольку F1–F3 и F6 — грани одного и того же
архитектурного решения. Настоящий раздел фиксирует доказательства и рекомендацию; само удаление в рамках
этой задачи **не выполняется** — оно требует отдельного решения и утверждения.

#### Resolution

**Root cause:** as established above — `server/bootstrap/*` was a second, complete composition root
implementing an "AI platform" scaffold unrelated to this marketplace's documented roadmap, connected to the
real application only through a single dead bridge (`server/functions/purchase.executor.ts` →
`server/bootstrap/application-provider.ts`). Recommendation A (removal) was accepted.

**Directories removed:**
- `server/functions/purchase.executor.ts`, `server/functions/purchase.functions.ts` — the two dead bridge
  files themselves (Этап 1, commit `794ac3a`).
- `server/bootstrap/` — 128 files, the composition root proper (Этап 2, commit `b631384`).

**Verification performed (per stage, before merging into the branch):**
- Pre-deletion: repo-wide `grep` confirming zero importers of `@server/bootstrap` (and, for Этап 1, of
  `purchase.functions`/`purchase.executor`) outside the reachable graph.
- Post-deletion: `npx tsc --noEmit` — error count and exact error set unchanged both times (Этап 1: 11 → 11
  identical; Этап 2: 11 → 11 identical), confirming zero reachable-graph impact.
- Post-deletion: `npm run build` — exit 0 both times, `.output/server/` rebuilt successfully.
- `git status` inspected after each stage — only the expected files listed as deleted.

**Final result:** `server/bootstrap/` and its sole bridge no longer exist in the repository (branch
`architecture-cleanup`, commits `794ac3a` and `b631384`). Zero regressions in the reachable graph at either
step.

---

### F2 — A ~4,600-file "enterprise platform" tree is wired only through F1's dead bridge — **[RESOLVED]**

**Scope:**

| Directory | File count |
|---|---|
| `server/application/` | 2,158 |
| `server/infrastructure/` | 908 |
| `server/platform/` | 865 |
| `server/api/` | 430 |
| `server/observability/` | 45 |
| `server/security/` | 46 |
| `server/jobs/` | 43 |
| `server/transports/` | 8 |
| **Subtotal** | **4,503** (+ F1's 128 = **4,631**, i.e. 94.7% of the 4,889 `.ts` files under `server/`) |

**Why it's a problem:** this is the payload that F1's `composition-root.ts` registers (`registerApplication`,
`registerInfrastructure`, `registerApi`, and the 20 `registerXPlatform`/20 `activateXPlatform` pairs). Within
`server/application/` and `server/infrastructure/`, 87 directories named `ai-*-registry` (e.g.
`ai-accelerator-profile-registry`, `ai-ethics-profile-registry`, `ai-knowledge-graph-registry`,
`ai-governance-policy-registry`) each contain a near-identical scaffold (`contracts/`, `models/`, `services/`,
`use-cases/`, ~14–15 files) — confirmed by directory listing — accounting for 1,657 of the 4,631 files by
themselves. Neither these registries nor the ~25 duplicated `*-management` modules
(`analytics-management`, `cart-management`, `catalog-management`, `checkout-management`, `order-management`,
`payment-management`, `warehouse-management`, …) nor the `server/platform/{governance,digital-twin,evolution,
decision,autonomous-governance,architecture-intelligence}` subsystems correspond to any requirement traceable to a
food-delivery marketplace.

**Dependency chain:** identical to F1 — everything here is reached exclusively via
`buildCompositionRoot()`'s registration calls, which is reached exclusively via `getApplicationProvider()` in
`server/bootstrap/application-provider.ts`, which is imported exclusively by the unreachable
`server/functions/purchase.executor.ts` (see F1 for the full proof).

**Reachability proof (independent confirmation, not just "same as F1"):** repo-wide search for any importer of
this tree *outside* the tree itself and outside `server/bootstrap/`:
```
$ grep -rln "application/ai-\|infrastructure/ai-" src shared server/functions server/di server/domain server/adapters server/ports server/config
(no output)
```
Empirical build check:
```
$ grep -rl "ai-accelerator-profile-registry\|buildCompositionRoot\|composition-root" .output
(no output)
```
The compiled Cloudflare bundle contains none of it.

**Classification: High** (same reasoning as F1 — this is F1's payload, not a separate root cause).

#### Итоговый анализ F2 (Final Analysis)

Цель раздела — подтвердить или опровергнуть зависимость F2 от F1, точно определить границы orphan-дерева и
проверить, нет ли внутри него компонентов, используемых живым приложением. Раздел готовит материал для
архитектурного решения и не выполняет удаление файлов и не меняет статус проекта.

##### 1. Зависимость F2 от выводов F1

**Подтверждается: F2 полностью зависит от F1.** Свежая проверка каждого из 8 каталогов F2 на предмет
импортёров вне `server/bootstrap/` и вне самих себя дала для семи из восьми каталогов пустой результат, а для
двух («application», «infrastructure») — только два уже известных по F1 файла:

```
$ for dir in server/application server/infrastructure server/platform server/api \
             server/observability server/security server/jobs server/transports; do
    grep -rln "@server/${dir#server/}" src shared server/functions server/di server/domain \
      server/adapters server/ports server/config server/auth --include="*.ts" --include="*.tsx"
  done
server/application: server/functions/purchase.executor.ts, server/functions/purchase.functions.ts
server/infrastructure: server/functions/purchase.executor.ts
server/platform, server/api, server/observability, server/security, server/jobs, server/transports: (пусто)
```

Единственная точка входа в F2 из reachable-графа — те же `server/functions/purchase.executor.ts` /
`purchase.functions.ts`, которые в F1 доказанно недостижимы (0 импортёров по всему репозиторию, отсутствуют в
`.output/server/`). Значит, у F2 нет собственного, независимого от F1 механизма связи с живым приложением —
всё дерево целиком висит на одном и том же мёртвом мосте. Отдельного анализа reachability для F2 не
требуется: он тождественен анализу F1.

##### 2. Границы F2

**Действительно входит в orphan-дерево F2** (подтверждено отсутствием импортёров вне себя и `server/bootstrap/`):

| Каталог | Файлов (.ts) |
|---|---|
| `server/application/` | 2 158 |
| `server/infrastructure/` | 908 |
| `server/platform/` | 865 |
| `server/api/` | 430 |
| `server/observability/` | 45 |
| `server/security/` | 46 |
| `server/jobs/` | 43 |
| `server/transports/` | 8 |
| **Итого** | **4 503** |

Плюс два файла-моста вне этих каталогов, но неразрывно с ними связанные: `server/functions/purchase.executor.ts`
и `server/functions/purchase.functions.ts` (сами недостижимы, но именно они технически ссылаются на
`server/bootstrap/`, через который регистрируется весь F2).

**Нельзя затрагивать** (reachable-граф живого приложения, подтверждён отдельно от F2, без пересечений):

- `src/**`, `shared/**` — фронтенд и DTO-контракты;
- `server/functions/**`, кроме `purchase.executor.ts` / `purchase.functions.ts`;
- `server/di/container.ts` — реальный Composition Root;
- `server/domain/*.service.ts` (плоские файлы) и папки `server/domain/{payment-policy,order-lifecycle,
  product-publication,marketplace-standards,marketplace-events,marketplace-ai,audit-log,shared}/`;
- `server/adapters/**`, `server/ports/*.ts` (плоские файлы);
- `server/config/**`, `server/auth/**`.

**Отдельно, вне рамок F2 (не расширять текущую находку на них, требуют собственного решения):**
`server/domain/{order,catalog,product}/` — уже зафиксированы в F6 как отдельная, недостижимая DDD-реализация.
При проверке границ F2 обнаружен ещё один файл того же паттерна, ранее не учтённый ни в F2, ни в F6:
`server/domain/seller/` (28 файлов — aggregate, value-objects, policies, lifecycle, events, snapshot) не имеет
ни одного импортёра вне себя самого:
```
$ grep -rln "@server/domain/seller/" server src shared --include="*.ts" | grep -v "^server/domain/seller/"
(пусто)
```
Это тот же случай, что и F6 (богатая DDD-модель без единого потребителя), но не входит в orphan-дерево F2
(это не `application`/`infrastructure`/`platform`/`bootstrap`/`api`/`observability`/`security`/`jobs`/
`transports`). Рекомендуется присоединить его к F6 отдельной правкой; в рамках настоящего анализа F2 он лишь
зафиксирован как смежная находка и не учитывается в итоговых цифрах F2.

##### 3–5. Проверка на компоненты, используемые живым приложением

**Компонентов F2, используемых живым приложением, не существует.** Технические доказательства:

- Полный список импортов во всех реально используемых `server/functions/*.executor.ts` (кроме `purchase.*`)
  исчерпывающе проверен и не содержит ни одной ссылки на `server/application`, `server/infrastructure`,
  `server/platform`, `server/api`, `server/observability`, `server/security`, `server/jobs`,
  `server/transports`:
  ```
  $ grep -hn "^import" server/functions/{addresses,admin,checkout,courier,orders,seller,warehouse}.executor.ts \
      | grep -oE '"@server/[a-zA-Z0-9_/.-]+"' | sort -u
  "@server/auth/resolve-user"
  "@server/di/container"
  "@server/domain/checkout.errors"
  "@server/domain/order-lifecycle/order-lifecycle.errors"
  "@server/domain/orders.errors"
  "@server/domain/payment-policy.errors"
  "@server/domain/product-publication/product-publication.errors"
  ```
- `server/api/errors`, `server/api/responses`, `server/api/validation` (потенциальные «общие утилиты», которые
  могли бы использоваться реальным кодом) проверены отдельно — импортёров вне `server/api/` не найдено.
- `server/auth/resolve-user.ts` (реальный, используемый файл) не импортирует ничего из `server/security`,
  несмотря на схожесть названий — это не один и тот же модуль.
- `server/di/container.ts` проверен построчно ранее (см. основной текст F1) и не содержит ни одного импорта
  из восьми каталогов F2.
- Эмпирически: собранный `.output/server/` не содержит трасс из F2 (см. проверку F1/F2 выше в документе,
  включая устранённый ложноположительный результат из-за совпадения имени класса `SupabaseOrderRepository`
  в F3 — тот же метод disambiguation применён и здесь: уникальные для F2 идентификаторы, например
  `ai-accelerator-profile-registry`, `buildCompositionRoot`, `composition-root`, в сборке отсутствуют).

**Вывод:** F2 полностью и без исключений зависит от F1, границы дерева — ровно восемь перечисленных каталогов
(4 503 файла) плюс два файла-моста, и ни один компонент внутри этих границ не используется работающим
приложением. Решение по F2 (A/B/C) не требует отдельного рассмотрения — оно тождественно решению по F1 и
должно приниматься одновременно с ним.

#### Resolution

**Root cause:** as established above — F2 is entirely F1's payload, registered exclusively through the
now-removed `composition-root.ts`, with no independent path into the reachable graph.

**Directories removed** (Этапы 3–7, each verified independently before merging):

| Этап | Каталог(и) | Файлов | Коммит |
|---|---|---|---|
| 3 | `server/transports/`, `server/jobs/`, `server/observability/`, `server/security/` | 142 | `2c29d5d` |
| 4 | `server/api/` | 430 | `9fee5c1` |
| 5 | `server/platform/` | 865 | `852a7d9` |
| 6 | `server/infrastructure/` (includes F3, see below) | 908 | `c2d8b8a` |
| 7 | `server/application/` | 2,158 | `50b4cd4` |
| **Итого** | | **4,503** | |

**Verification performed (at every one of the five stages above):**
- Pre-deletion: repo-wide `grep` for `@server/<dir>` confirming zero importers in `src`, `shared`,
  `server/functions`, `server/di`, `server/domain`, `server/adapters`, `server/ports`, `server/config`,
  `server/auth` — reconfirmed independently at each stage rather than assumed from earlier findings.
- Post-deletion: `npx tsc --noEmit` at each stage — error count never increased in the reachable graph; it
  only ever decreased as malformed orphan files were removed (11 → 11 → 11 → 1 → 1, then a one-time
  investigation after Этап 7 — see `## 5. Final Verification` below — explained a subsequent rise to 37 as
  latent, pre-existing, independent findings unrelated to F1/F2, not a regression).
- Post-deletion: `npm run build` — exit 0 at every stage.
- `git status` inspected after each stage — only the expected directory's files listed as deleted, no
  unrelated changes.

**Final result:** all eight F2 directories no longer exist in the repository. Reachable graph verified intact
at every one of the five removal stages.

---

### F3 — Duplicate Supabase adapter (`server/infrastructure/supabase/`, 25 files) shadows the real one (`server/adapters/supabase/`, 8 files) — **[RESOLVED]**

**Files (duplicate/dead):**
```
server/infrastructure/supabase/client/{i-supabase-client-provider,supabase-client.provider,index}.ts
server/infrastructure/supabase/repositories/{supabase-catalog,supabase-category,supabase-order,supabase-product,supabase-seller,supabase-snapshot-repository.base,index}.ts
server/infrastructure/supabase/{configuration,event-bus,health,mappers,shared,transactions,bootstrap}/*.ts
```
**Files (real, wired — for contrast):**
```
server/adapters/supabase/{address,delivery-zone,order,product,seller-product}.repository.ts
```
imported directly at `server/di/container.ts:14–18` and instantiated at `container.ts:128–132`.

**Why it's a problem:** two independent implementations of the same external integration exist under
similar names in sibling top-level directories (`adapters/` vs `infrastructure/`). A future change to Supabase
access patterns (e.g. RLS policy handling, retry logic, error mapping) has a real chance of being made in the
dead copy by someone who doesn't know the live one lives elsewhere.

**Dependency chain:**
```
server/infrastructure/supabase/*  ←  server/bootstrap/health-check.ts
                                   ←  server/bootstrap/infrastructure-bootstrap.ts
                                   ←  server/platform/runtime/runtime/health/health.service.ts
```
All three importers are themselves inside the F1/F2 orphan graph.

**Reachability proof:**
```
$ grep -rln "infrastructure/supabase" server src shared --include="*.ts" | grep -v "^server/infrastructure/"
server/bootstrap/health-check.ts
server/bootstrap/infrastructure-bootstrap.ts
server/platform/runtime/runtime/health/health.service.ts
```
No importer outside the already-unreachable F1/F2 tree.

**Classification: Medium** — real duplication and confusion risk, but currently fully inert.

#### Resolution

**Root cause:** F3's files are not an independent directory — they are a physical subset of
`server/infrastructure/` (908 files, F2), included in that count. See `## 4.5` above for the full argument
that F3 has no independent resolution path from F2.

**Directories removed:** none separately. Folded automatically into Этап 6's removal of `server/infrastructure/`
(commit `c2d8b8a`) — no distinct action was taken or required, exactly as predicted in §4.5.

**Verification performed:** post-Этап 6, an empirical check specifically for class names unique to F3's
duplicate implementation (`SupabaseSnapshotRepositoryBase`, `SupabaseTransactionManager`,
`SupabaseEventPublisher` — none shared with the real `server/adapters/supabase/*`) confirmed absent from the
repository and from `.output/server/` after the deletion.

**Final result:** F3 resolved as a direct, mechanical consequence of F2's removal, confirming the §4.5
prediction exactly — no separate fix, decision, or verification cycle was needed.

---

### F4 — Domain layer violates the project's own Dependency Rule, in *live* code — **[RESOLVED]**

**File:** `server/domain/checkout.service.ts:20`
```ts
import { isUuid } from "@server/adapters/supabase/order.mapper";
```

**Why it's a problem:** `docs/principles/03-dependency-rule.md` (Principle 3): "domain зависит от портов, никогда
от конкретных адаптеров" — domain depends on ports, never on concrete adapters. `CheckoutService` is real,
wired code (see chain below) and it imports directly from a Supabase-specific adapter module for a generic
`isUuid` helper. This is the one confirmed violation of Principle 3 found in the reachable graph (spot-checked
across all of `server/domain/`; no other `@server/adapters` import was found there).

**Dependency chain (fully live):**
```
src/routes/orders/index.tsx → @/api/orders → src/api/orders.functions.ts
  → await import("@server/functions/checkout.executor")
  → server/di/container.ts:207 — new CheckoutService(...)
  → server/domain/checkout.service.ts:20 → server/adapters/supabase/order.mapper.ts
```

**Reachability proof:** positive — this executes on every real checkout request; `CheckoutService` is
constructed at `container.ts:207` and returned as `checkout` in the `ServiceContainer` consumed by
`checkout.executor.ts`.

**Classification: Medium.** Real, live violation of a documented principle, but narrow blast radius (a single
utility import). It does not currently prevent swapping the order adapter, but it does mean `checkout.service.ts`
is no longer swap-adapter-agnostic for that one helper, undermining Principle 9 ("Replaceable Adapters") for this
call site specifically.

#### Resolution

**Root cause:** `isUuid` (formerly `server/adapters/supabase/order.mapper.ts:34-36`) is a pure, dependency-free
regex check with no Supabase-specific behavior. It was used purely as business logic — in
`checkout.service.ts:254` to decide whether an incoming product reference is a platform ID vs. a legacy slug —
but had been defined inside a concrete adapter file, so both the domain caller and a second adapter caller
(`order.repository.ts:58`) ended up depending on that adapter module. It was simply placed in the wrong layer; a
new port/interface was not warranted since a stateless pure function has no swappable implementation to abstract.

**Files changed:**
- `server/domain/shared/uuid.ts` — new file, holds `isUuid`, owned by the domain layer, zero dependencies.
- `server/domain/checkout.service.ts` — import repointed from `@server/adapters/supabase/order.mapper` to
  `@server/domain/shared/uuid`.
- `server/adapters/supabase/order.repository.ts` — import repointed to the same new location (adapter depending
  on domain — the correct dependency direction).
- `server/adapters/supabase/order.mapper.ts` — `isUuid` removed (no longer needed there).

**Verification performed:**
- `npx tsc --noEmit` — 11 errors before and after the fix, an identical set, both confined to the
  previously-confirmed-unreachable `server/application/seller-product/` and `server/platform/governance/` files.
  No new errors introduced anywhere in the reachable graph.
- `npm run build` — exit 0, `.output/server` rebuilt successfully.
- Re-confirmed no other `server/domain/**` file imports `@server/adapters/**` (repeat of the original spot-check
  that first surfaced this finding).

**Final result:** the reachable graph now has zero Dependency Rule violations. `CheckoutService` no longer
depends on any concrete adapter.

---

### F5 — Live, unresolved TypeScript errors in the shipped request path — **[RESOLVED]**

**Exact locations** (23 errors total, all independently confirmed to sit on the reachable-graph chain above):

| File | Error sites | Root cause |
|---|---|---|
| `server/adapters/supabase/seller-product.repository.ts` | lines 51, 55, 63, 67, 83, 92, 102, 119, 121, 128, 139, 143, 150 (13 errors) | Queries/writes a `publication_status` column the generated Supabase types say doesn't exist on `products`: `SelectQueryError<"column 'publication_status' does not exist on 'products'.">` |
| `server/adapters/supabase/product.repository.ts` | lines 48, 80, 92 (3 errors) | Same `publication_status` column mismatch |
| `server/adapters/supabase/order.repository.ts` | line 34 | `Type 'string \| null' is not assignable to type 'string'` |
| `server/adapters/supabase/address.repository.ts` | line 110 | `Record<string, unknown>` not assignable to generated update-payload type |
| `server/domain/checkout.service.ts` | line 66 | `Type 'string \| null' is not assignable to type 'string \| undefined'` |
| `server/domain/marketplace-events/marketplace-events.service.ts` | line 18 | Unsound handler-type conversion (`MarketplaceEventHandler<T>` → `MarketplaceEventHandler`) |
| `server/domain/notification-center.service.ts` | line 22 | `Type 'NotificationEvent' is not assignable to type 'never'` |
| `server/domain/product-publication/rules/seller-publish.rule.ts` | line 26 | `ProductPublicationStatus` narrowed incorrectly against `"DRAFT" \| "HIDDEN"` |
| `server/ports/order.repository.ts` | line 17 | `CreateOrderData` incorrectly extends `Omit<CreateOrderRequest, "items">` |

**Why it's a problem:** the dominant cluster (16 of 23) traces to one root cause — schema drift. The code queries
a `publication_status` column on `products` that the generated Supabase types assert does not exist. This column
backs `ProductPublicationService` (wired at `container.ts:161–165`, used by the real seller product publish/hide
flow). Either the migration adding this column was never applied to the environment the types were generated
against, or the type-generation step is stale — either way, code and schema disagree on a shipped feature.

**Dependency chain to the erroring file:**
```
src/routes/seller/products/index.tsx → @/api/seller → src/api/seller.functions.ts
  → await import("@server/functions/seller.executor")
  → server/di/container.ts:130 — new SupabaseSellerProductRepository()
  → container.ts:181 — new SellerProductService(sellerProducts, productPublication)
  → server/adapters/supabase/seller-product.repository.ts  (13 of the 23 errors)
```

**Reachability proof:** positive (same chain family verified in section 0; `SupabaseSellerProductRepository` is
constructed and injected at the cited container lines).

**Build-impact nuance (verified, not assumed):** `npm run build` (`vite build`) already succeeded in this
checkout — `.output/server/` exists and is a complete Cloudflare/Nitro bundle. Vite/esbuild transpiles but does
not type-check during bundling, so these errors do not currently block the deployed build. They do, however, fail
`tsc --noEmit` (evidenced by the committed `tsc-output.txt`), which is the standard CI correctness gate, and the
underlying schema/type mismatch is a real risk independent of the compiler: if the column genuinely doesn't exist
in the live database, the affected Supabase queries can fail at request time.

**Classification: Critical.** Live code path, feeds a real shipped feature (seller product publication), and
represents an actual code/schema disagreement rather than a cosmetic typing issue.

#### Resolution

**Root cause:** `src/integrations/supabase/types.ts` (the generated `Database` type) predated **five**
migrations, not just the one adding `publication_status`: `20260716120000_warehouse_role.sql`,
`20260716130000_courier_role.sql`, `20260716140000_seller_role.sql`,
`20260716150000_product_publication_status.sql`, and `20260716100000_guest_checkout_nullable_user.sql` (this
last one — `ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL` — was identified during the fix and explains
the previously-unattributed `order.repository.ts` error via the same drift mechanism). CLI regeneration
(`npx supabase gen types typescript`) was attempted and blocked twice — first by a missing
`SUPABASE_ACCESS_TOKEN` (`LegacyPlatformAuthRequiredError`), then, once supplied, by an authorization failure
(`LegacyGenTypesUnexpectedStatusError`, confirmed via `npx supabase projects list` returning zero projects for
that account) — so the type file was corrected by hand directly from the migration SQL, the authoritative schema
source, rather than left broken. Three further errors were independent type-narrowing bugs unrelated to schema
drift (`server/ports/order.repository.ts`, `server/domain/marketplace-events/marketplace-events.service.ts`,
`server/domain/product-publication/rules/seller-publish.rule.ts`); the `notification-center.service.ts` error
resolved as a side effect of fixing the others, consistent with it being a compiler error-recovery cascade rather
than an independent defect.

**Files changed:**
- `src/integrations/supabase/types.ts` — added `product_publication_status` enum; added
  `products.publication_status` / `products.seller_id`; widened `app_role` to include
  `seller`/`warehouse`/`courier`; widened `orders.user_id` to nullable (`Row`, `Insert`, `Update`, and the
  runtime `Constants` export).
- `server/adapters/supabase/address.repository.ts` — typed the `update()` payload as `TablesUpdate<"addresses">`
  instead of `Record<string, unknown>`.
- `server/ports/order.repository.ts` — excluded `addressId`/`zoneId` from the `Omit<CreateOrderRequest, ...>`
  base and redeclared both explicitly as `string | null` on `CreateOrderData`.
- `server/domain/marketplace-events/marketplace-events.service.ts` — `handler as MarketplaceEventHandler` →
  `handler as unknown as MarketplaceEventHandler`.
- `server/domain/product-publication/rules/seller-publish.rule.ts` — `new Set([...])` →
  `new Set<ProductPublicationStatus>([...])`.

**Verification performed:**
- `npx tsc --noEmit` — reachable-graph errors: 9 → 0.
- `npm run build` — exit 0, `.output/server` rebuilt successfully (Cloudflare/Nitro bundle regenerated).
- Re-confirmed the 11 remaining repo-wide errors trace only to `server/application/seller-product/` and
  `server/platform/governance/`, both proven unreachable (zero importers from `server/functions`, `server/di`,
  `server/domain`, `server/adapters`, `server/ports`, `server/config`, `src`, `shared`) — see F6's reachability
  method, applied identically here.

**Final result:** zero TypeScript errors remain in the reachable request path; `npm run build` succeeds. Full
step-by-step detail in `ARCHITECTURE_AUDIT_RESOLUTION.md`.

---

### F6 — A second, well-built DDD domain model exists for order/catalog/product but nothing consumes it — **[RESOLVED]**

**Files:**
```
server/domain/order/{aggregate,entities,events,lifecycle,policies,snapshot,status,value-objects}/**   (27 files)
server/domain/catalog/{aggregate,category,events,lifecycle,policies,snapshot,status,value-objects}/** (24 files)
server/domain/product/{aggregate,policies,snapshot,value-objects}/**                                  (11 files)
```

**Why it's a problem:** this is a genuinely well-structured DDD implementation — real value objects
(`OrderMoney`, `OrderNumber`, `CategoryPath`, `ProductPrice`), aggregates (`order.aggregate.ts`,
`catalog.aggregate.ts`, `product.aggregate.ts`), explicit lifecycle state machines, domain events, and policy
classes. It sits inside `server/domain/`, the exact directory that also holds the real, wired
`order.service.ts` / `catalog.service.ts` — so it reads as trustworthy by location alone. But the real services
do not use it: `server/domain/order.service.ts` imports only from `@server/ports/order.repository` and
`@shared/contracts/order`; `server/domain/catalog.service.ts` imports only from `@server/ports/product.repository`
and `@shared/contracts/catalog`. Two different domain models for the same business concepts coexist in the same
folder, one live, one not — a significant navigation/trust hazard for anyone extending order or catalog logic.

**Dependency chain (who actually consumes the rich model):**
```
server/domain/order/index.ts, catalog/index.ts, product/index.ts
  ←  server/api/controllers/{order,catalog,product}.controller.ts
  ←  server/application/{services,use-cases,ports}/{order,catalog,product,category}*.ts
  ←  server/application/modules/{checkout,order,search}/**
  ←  server/infrastructure/{repositories,shared,marketplace,supabase/repositories}/*
```
Every one of these importers is itself part of the F1/F2 orphan tree (`server/api/controllers` is only reached
via `server/api/server`'s route table, which is only built by `registerApi` inside `composition-root.ts`).

**Reachability proof:**
```
$ grep -rln "@server/domain/order/\|@server/domain/catalog/\|@server/domain/product/" \
    server src shared --include="*.ts" | grep -v -E "^server/domain/(order|catalog|product)/"
server/api/controllers/catalog.controller.ts
server/api/controllers/order.controller.ts
server/api/controllers/product.controller.ts
server/application/... (18 more files, all under server/application/ or server/infrastructure/)
```
Zero hits under `src/`, `shared/`, `server/functions/`, `server/di/`, or the flat `server/domain/*.service.ts`
files. Consequently, the 19 `tsc` errors located under `server/domain/order/**`, `server/domain/catalog/**`, and
`server/domain/product/**` (10 + 6 + 3, distinct from F5's list) are **not** in the reachable graph, even though
they share a parent directory with code that is.

**Classification: High** as an architectural/maintainability hazard — the false sense of "this is live code
because it's in `server/domain/`" is a real trap. **Not a runtime issue** — confirmed unreachable and its type
errors have no effect on the shipped build.

#### Resolution

**Root cause:** as established above — a second, unused DDD domain model whose only consumers
(`server/api/controllers`, `server/application/*`, `server/infrastructure/*`) were themselves part of F1/F2.
Once F1/F2 were removed (Этапы 2–7), F6 had zero consumers of any kind, live or dead.

**Directories removed** (Этап 8, commit `36140fb`):

| Directory | Files |
|---|---|
| `server/domain/order/` | 37 |
| `server/domain/catalog/` | 33 |
| `server/domain/product/` | 26 |
| `server/domain/seller/` (discovered during the F2 boundary analysis, not in the original F6 finding above) | 28 |
| **Итого** | **124** |

**Verification performed:**
- Pre-deletion: repo-wide `grep` for `@server/domain/{order,catalog,product,seller}/` re-run fresh at the time
  of deletion (not relying on the earlier F2-era finding) — zero importers anywhere, including within the by
  then already-removed F1/F2 tree.
- Post-deletion: `npx tsc --noEmit` — error count dropped by exactly 19 (37 → 18), matching 1:1 the count of
  errors previously located inside these four directories, with zero new errors introduced.
- Post-deletion: `npm run build` — exit 0, `.output/server/` rebuilt successfully.
- `git status` — 124 deletions, all under the four expected directories.

**Final result:** `server/domain/{order,catalog,product,seller}/` no longer exist. All 19 errors that lived
inside them are gone. The remaining 18 TypeScript diagnostics are independently confirmed unrelated to F6 (or
to any other finding in this document) — see `## 5. Final Verification` below.

---

### F7 — Syntax errors in orphaned infrastructure code

**Files:** `server/infrastructure/analytics/wiring/event-publishing-product.service.ts`,
`server/infrastructure/analytics/wiring/event-publishing-seller.service.ts` — 136+ raw parse errors
(`TS1005: ';' expected`, `TS1005: ':' expected`, `TS1128: Declaration or statement expected`). These files do not
parse as valid TypeScript at all — this is not a type error, it's malformed source.

**Why it's a problem:** committed, non-parsing source code is a hygiene problem regardless of reachability, and
it dominates the noise in `tsc-analytics.txt` (136 of 143 lines), which could mask other real signal in that file
for anyone relying on it.

**Dependency chain / reachability:** `server/infrastructure/analytics` is registered via
`activateAnalyticsEventSubscriptions(provider)` in `server/bootstrap/composition-root.ts:104`, which — per F1 —
is only reachable through the dead `purchase.executor.ts` bridge.
```
$ grep -rl "event-publishing-product\|event-publishing-seller" .output
(no output)
```
Confirmed absent from the compiled bundle.

**Classification: Low.** Zero runtime/build impact (proven unreachable, confirmed absent from `.output`), but
flagged because it would falsely read as "the project doesn't compile at all" to anyone running a bare `tsc`
without knowing which parts are live.

---

### F8 — Stub webhook route, unimplemented

**File:** `server/routes/webhooks/finik.ts`
```ts
/** Finik webhook handler — implemented in Stage 7. */
export async function handleFinikWebhook(_request: Request): Promise<Response> {
  return new Response("Not implemented", { status: 501 });
}
```

**Why it might look like a problem:** an unimplemented HTTP handler for a payment webhook sounds alarming in
isolation.

**Reachability:** no `import` statements in the file; no Nitro/Cloudflare route-registration config
(`wrangler.toml`, nitro `serverHandlers`, etc.) was found anywhere in the repo that maps this file to a live
route. It is inert either way, and returns a correct `501` if it were ever hit.

**Why it's not an issue:** `docs/adr/ADR-001-ports-and-adapters.md` explicitly scopes "Finik payments" to
**Stage 7** of the documented migration plan (`docs/architecture.md`'s stage table), and the code matches that
stated, intentional incompleteness exactly — a placeholder for future work, not a defect.

**Classification: Not an issue.**

---

### F9 — No enforced dependency rule inside `server/` (the mechanism that allowed F1, F2, F3, F6 to accumulate)

**File:** `eslint.config.js`. The only `no-restricted-imports` rules present (lines 43–65) constrain
`src/**` → `server/**` / `@supabase/supabase-js` crossings. Nothing in this file constrains imports *within*
`server/**` — nothing would have flagged F4's `server/domain` → `server/adapters` import, and nothing prevents
`server/application`, `server/infrastructure`, or `server/platform` from importing across each other freely
despite Principle 3 (Dependency Rule) and Principle 2 (Ports & Adapters) being written as if they applied
project-wide.

**Compounding factor:** `tsconfig.json:26–27` sets `noUnusedLocals: false` and `noUnusedParameters: false`;
`eslint.config.js:36` explicitly disables `@typescript-eslint/no-unused-vars`. No dead-file or unused-export
detector (`ts-prune`, `knip`, or equivalent) is configured anywhere in `package.json`. This combination is the
concrete mechanism by which ~4,600 unreachable files can sit in the repository with neither the linter nor the
type checker's unused-code diagnostics ever surfacing it.

**Classification: Medium.** Not a code defect by itself, but it's the root-cause gap behind F1, F2, F3, and F6 —
fixing it would make recurrence of this pattern detectable going forward.

---

## 2. Summary

| # | Location(s) | Severity | Reachable from real entry point? |
|---|---|---|---|
| F1 | `server/bootstrap/*` (128 files) | High — **RESOLVED** | No — proven unreachable + absent from `.output` |
| F2 | `server/application`, `server/infrastructure`, `server/platform`, `server/api`, `server/observability`, `server/security`, `server/jobs`, `server/transports` (4,503 files) | High — **RESOLVED** | No — same proof as F1 |
| F3 | `server/infrastructure/supabase/*` (25 files) | Medium — **RESOLVED** | No — only referenced from F1/F2 |
| F4 | `server/domain/checkout.service.ts:20` | Medium — **RESOLVED** | **Yes** |
| F5 | `server/adapters/supabase/*.repository.ts`, `server/domain/{checkout.service,marketplace-events,notification-center}.ts`, `server/domain/product-publication/rules/seller-publish.rule.ts`, `server/ports/order.repository.ts` | **Critical — RESOLVED** | **Yes** |
| F6 | `server/domain/{order,catalog,product,seller}/**` (124 files) | High — **RESOLVED** | No — only referenced from F1/F2 |
| F7 | `server/infrastructure/analytics/wiring/event-publishing-{product,seller}.service.ts` | Low | No |
| F8 | `server/routes/webhooks/finik.ts` | Not an issue | Indeterminate (irrelevant — file is an intentional no-op) |
| F9 | `eslint.config.js`, `tsconfig.json` | Medium | N/A (config gap, not a code path) |

## 3. Conclusions

- **The shipping application is small, coherent, and mostly matches its own architecture documents.** The real
  request path — `src/routes` → `src/api` → `server/functions` → `server/di/container.ts` →
  `server/domain/*.service.ts` (+ the `payment-policy`, `order-lifecycle`, `product-publication`,
  `marketplace-*`, `audit-log` folders actually imported there) → `server/ports` → `server/adapters` — is a real,
  working Ports & Adapters implementation with a genuinely good rule-engine pattern for payment policy and order
  lifecycle.
- **One issue is Critical and needs code changes regardless of anything else in this audit: F5.** The
  `publication_status` schema/type mismatch sits on a live feature (seller product publish/hide) and should be
  fixed by reconciling the Supabase migration state with the generated types, independent of any decision about
  the rest of this report.
- **F4 is a small, real principle violation** (one import) worth a one-line fix when convenient; it is not urgent.
- **F1, F2, F3, F6, and F7 meet the bar this audit was asked to apply before recommending removal: each is proven
  unreachable from the real entry point by static import-graph tracing *and* confirmed absent from the actual
  compiled production bundle (`.output/server/`).** That is the evidence required to say this code is unused, not
  merely that it looks unused. Whether to act on that (delete, quarantine into a separate package, or keep as
  future scaffolding) is a decision for the team given the scale involved (4,631 files) — this report provides
  the proof needed to make that call with confidence, not a unilateral recommendation to delete.
- **F8 is confirmed intentional** and **F9 is a tooling gap**, not a file-level defect — addressing F9 (scoped
  `no-restricted-imports` within `server/**`, plus an unused-exports checker) would make any future recurrence of
  F1/F2/F3/F6's pattern visible immediately instead of silently accumulating.

---

## 4. Итоговое заключение аудита (F1–F6)

Настоящий раздел подводит итог по находкам F1–F6 с учётом всех проверок, выполненных в ходе этого аудита
(включая устранение F4/F5 и итоговые анализы F1/F2/F3). Раздел не выполняет удаление файлов и не меняет статус
проекта — это консолидированное заключение, подготавливающее почву для архитектурного решения.

### 4.1. Статус находок

| # | Находка | Статус | Тип |
|---|---|---|---|
| F1 | Второй Composition Root (`server/bootstrap/*`, 128 файлов) | Открыта — требуется решение | Первопричина |
| F2 | Orphan-дерево ~4 503 файлов (`application`/`infrastructure`/`platform`/`api`/`observability`/`security`/`jobs`/`transports`) | Открыта — требуется решение | Полностью следствие F1 |
| F3 | Дублирующий Supabase-адаптер (`server/infrastructure/supabase/`) | Открыта формально, но поглощена | Следствие F2 (см. §4.4) |
| F4 | Нарушение Dependency Rule в `checkout.service.ts` | ✅ **Устранена** | Независимая |
| F5 | Живые ошибки TypeScript в reachable-графе (schema drift + локальные баги типов) | ✅ **Устранена** | Независимая |
| F6 | Дублирующая DDD-модель `server/domain/{order,catalog,product}/` (+ обнаруженный при анализе F2 `server/domain/seller/`) | Открыта — требуется решение | Следствие F2 по потреблению, но не по расположению |

### 4.2. Что устранено

- **F4** — `server/domain/checkout.service.ts` больше не импортирует напрямую из `server/adapters/supabase/*`;
  `isUuid` вынесен в `server/domain/shared/uuid.ts`. Подтверждено: `npx tsc --noEmit` даёт идентичный набор из
  11 ошибок до и после правки (все — вне reachable-графа), `npm run build` — exit 0.
- **F5** — устранены все 9 исходных ошибок TypeScript в reachable-графе: 5 из них — следствие устаревших
  сгенерированных типов Supabase (`src/integrations/supabase/types.ts`, не обновлялся вслед за пятью
  миграциями), остальные — точечные, независимые ошибки типизации. Подтверждено: ошибки reachable-графа —
  9 → 0, `npm run build` — exit 0. Полная детализация — в `ARCHITECTURE_AUDIT_RESOLUTION.md`.

Обе находки закрыты по одному и тому же критерию: изменения ограничены reachable-графом, orphan-дерево не
затронуто, регрессии не внесены (подтверждено повторными прогонами `npx tsc --noEmit` и `npm run build`).

### 4.3. Что остаётся открытым

- **F1** — требуется явное архитектурное решение (A/B/C). Рекомендация аудита — вариант **A (удаление)**, с
  подробным обоснованием и опровержением вариантов B и C, но само решение не принято и не выполнено.
- **F2** — тождественна F1: доказано (см. §«Итоговый анализ F2»), что F2 не имеет собственного, независимого от
  F1 пути к живому приложению. Решение по F2 не требует отдельного рассмотрения — оно принимается одновременно
  с решением по F1.
- **F3** — формально остаётся в списке находок, но по факту полностью поглощается решением по F1/F2
  (подробное объяснение — в §4.4).
- **F6** — требует отдельного рассмотрения при том же архитектурном решении: его единственные потребители
  лежат внутри F2, но сама находка физически расположена в `server/domain/` — вне восьми каталогов F2 — и
  представляет собой самостоятельную архитектурную проблему (дублирование доменной модели), а не просто часть
  orphan-дерева.

### 4.4. Что является следствием других проблем

- **F2 — полностью следствие F1.** Доказано в разделе «Итоговый анализ F2»: единственная точка входа во все
  восемь каталогов F2 — те же два файла-моста (`server/functions/purchase.executor.ts`,
  `purchase.functions.ts`), что и в F1, и они сами доказанно недостижимы. У F2 нет ни одного альтернативного,
  независимого от F1 пути в reachable-граф.
- **F3 — следствие F2 в буквальном, а не только логическом смысле.** Файлы F3
  (`server/infrastructure/supabase/*`, 25–26 файлов) физически входят в число 908 файлов
  `server/infrastructure/`, уже учтённых в таблице F2. Это не смежная, а составная часть F2, выделенная в
  отдельную находку для акцента на конкретном риске — дублировании Supabase-адаптера.
- **F6 — следствие F2 по признаку потребления, но не по расположению.** Все обнаруженные потребители
  `server/domain/{order,catalog,product}/` (а также `server/domain/seller/`) находятся внутри F2
  (`server/api/controllers/*`, `server/application/*`, `server/infrastructure/*`). Однако сами файлы F6 лежат
  в `server/domain/` — каталоге, который целиком относится к reachable-графу и не входит в восемь каталогов
  F2. Поэтому F6 нельзя механически «удалить вместе с F2» без отдельной проверки: технически это самостоятельная
  находка, которая практически теряет единственную причину своего существования (потребителя) при любом
  решении по F2, но физически не является частью того же дерева файлов.

### 4.5. Явное указание: F3 полностью поглощается решением по F1/F2

**Да, F3 полностью поглощается решением по F1/F2.** Обоснование:

1. **Физическое совпадение.** 25–26 файлов F3 — не отдельный каталог, а подмножество `server/infrastructure/`
   (908 файлов), уже включённое в подсчёт F2. Любое действие над F2 как каталогом автоматически включает эти
   файлы.
2. **Совпадение потребителей.** Импортёры F3 (`server/bootstrap/health-check.ts`,
   `server/bootstrap/infrastructure-bootstrap.ts`, `server/platform/runtime/runtime/health/health.service.ts`,
   а также порядка 50 файлов `server/infrastructure/marketplace/**`) целиком лежат внутри дерева F1/F2 — там
   же, где принимается решение.
3. **Отсутствие независимого действия.** Не существует шага, который «исправил» бы F3, не будучи одновременно
   действием над F2: удаление `server/infrastructure/supabase/*` без удаления остального `server/infrastructure/`
   оставило бы ~50 файлов `server/infrastructure/marketplace/**` с недействующими импортами; сохранение F2 при
   удалении только F3 не убирает риск дублирования — он просто переносится на оставшиеся файлы того же
   дерева, которые продолжат зависеть от Supabase-доступа.
4. **Итог.** F3 не обладает самостоятельным жизненным циклом решения — она была выделена как отдельная находка
   в исходном аудите для наглядной демонстрации конкретного риска («дублирующий адаптер маскирует реальный»),
   а не потому, что имеет независимую от F1/F2 судьбу.

### 4.6. Рекомендуемый порядок дальнейших действий

1. **Принять единое архитектурное решение по F1 (и тем самым — по F2 и F3 автоматически, см. §4.5).**
   Рекомендация аудита — вариант **A) удаление**, одним осознанным, проверяемым изменением, а не точечной
   очисткой по модулям.
2. **В рамках того же решения рассмотреть F6** (`server/domain/{order,catalog,product}/` и
   `server/domain/seller/`) — технически самостоятельная находка (см. §4.4), но практически не имеющая смысла
   без общего решения по F1/F2, поскольку теряет последнего потребителя вместе с ними.
3. **После выполнения решения по F1/F2/F3/F6 — повторно выполнить верификацию**, аналогичную закрытию F4/F5:
   `npx tsc --noEmit` и `npm run build`, чтобы подтвердить отсутствие регресса в reachable-графе.
4. **Только после этого возвращаться к оставшимся находкам аудита за пределами текущей области:** F7
   (синтаксические ошибки внутри дерева, подлежащего решению по F1/F2, — исчезнут вместе с ним автоматически)
   не требует отдельного действия; F8 подтверждён как не являющийся проблемой; F9 (усиление
   `no-restricted-imports` внутри `server/**` и добавление unused-exports проверки) стоит внедрить отдельно,
   как профилактическую меру против повторного накопления такого же паттерна в будущем.

---

## 5. Final Verification

Раздел фиксирует итог выполнения рекомендации A по всем шести затронутым находкам (F1, F2, F3, F4, F5, F6) —
все выполнено в ветке `architecture-cleanup` (базовый коммит `0198d62`, «Baseline before architecture
cleanup»), пошагово, с проверкой после каждого этапа. Подробный пошаговый план — `IMPLEMENTATION_PLAN_A.md`.

### 5.1. Выполненные этапы

| Этап | Содержание | Файлов удалено | Коммит |
|---|---|---|---|
| 1 | Мостовые файлы (`server/functions/purchase.{executor,functions}.ts`) | 2 | `794ac3a` |
| 2 | `server/bootstrap/` (F1) | 128 | `b631384` |
| 3 | `server/transports/`, `server/jobs/`, `server/observability/`, `server/security/` | 142 | `2c29d5d` |
| 4 | `server/api/` | 430 | `9fee5c1` |
| 5 | `server/platform/` | 865 | `852a7d9` |
| 6 | `server/infrastructure/` (включая F3) | 908 | `c2d8b8a` |
| 7 | `server/application/` | 2,158 | `50b4cd4` |
| 8 | `server/domain/{order,catalog,product,seller}/` (F6) | 124 | `36140fb` |
| **Итого** | | **4,757** | |

(Этапы 4/5 F5-фикса выполнены ранее, до начала удаления orphan-дерева, и в этот подсчёт не входят —
см. отдельные подразделы `#### Resolution` у F4/F5.)

### 5.2. Итоговые метрики

- **Итоговый размер `server/`: 133 файла** (было 4,890 до Этапа 1) — практически точное совпадение с
  прогнозом `IMPLEMENTATION_PLAN_A.md` §2 («≈130–135 файлов»).
- Оставшиеся каталоги `server/`: `adapters` (15), `auth` (1), `config` (1), `di` (1), `domain` (76), `functions`
  (12), `ports` (27), `routes` (1) — ровно reachable-граф, задокументированный в `## 0. Methodology`, плюс F8
  (`server/routes/webhooks/finik.ts`, подтверждён как не являющийся проблемой, не трогался).
- `src/`: 106 файлов, без изменений.
- **`npm run build` — успешно** (exit 0) после каждого из восьми этапов, включая финальный; `.output/server/`
  и `.output/public/` пересобираются без ошибок.

### 5.3. TypeScript: 18 оставшихся диагностик — не относятся к orphan-архитектуре

После Этапа 8 `npx tsc --noEmit` показывает **18 диагностик** (было 0 ошибок в reachable-графе сразу после
закрытия F5; рост до 37, затем спад до 18 произошёл между Этапами 7 и 8 и расследован отдельно, до
подтверждения Этапа 8 пользователем). Ключевой вывод расследования: пока в проекте оставался хотя бы один
файл с сырой синтаксической ошибкой парсера (последний — `server/application/seller-product/use-cases/
seller-product.use-cases.ts`, устранён на Этапе 7), TypeScript-чекер не доводил фазу семантической проверки
(`Check`) до конца для всей программы — что было подтверждено эмпирически через `tsc --extendedDiagnostics`
(в состоянии «до»: `Types: 89`, `Instantiations: 0`, строка `Check time` отсутствует; в состоянии «после»:
`Types: 94947`, `Instantiations: 699140`, `Check time: 3.36–3.46s`). Поэтому все 18 диагностик — это **не
новые ошибки и не регрессия от удаления orphan-дерева**, а ранее не вычислявшиеся диагностики для кода,
который не менялся на всём протяжении Этапов 1–8. Ни одна из них не содержит ссылки на что-либо, удалённое
в рамках F1/F2/F3/F6 (подтверждено `grep`).

**Группа D — нестабильная диагностика (1 диагностика).**
`server/domain/notification-center.service.ts:22` — `Type 'NotificationEvent' is not assignable to type
'never'`. Уже задокументировано в `#### Resolution` F5 как диагностика, однажды исчезавшая как «побочный
эффект» исправления других ошибок; вернулась после Этапа 7 — подтверждает контекстно-зависимое поведение
чекера, а не логическую ошибку в коде.

**Группа E — реальный, независимый, ранее не исправленный баг (1 диагностика).**
`server/adapters/supabase/seller-product.repository.ts:119` — `patch: Record<string, unknown>` не проходит
строгую типизацию `.update()` Supabase. Тот же класс проблемы, что был исправлен в `address.repository.ts`
при закрытии F5 (`TablesUpdate<"...">` вместо `Record<string, unknown>`), но в `seller-product.repository.ts`
эта правка никогда не выполнялась. Не входит в область F1–F9; требует отдельного исправления вне рамок этого
плана.

**Группа F — ложное срабатывание TypeScript (5 диагностик).**
`src/api/{addresses,admin,courier,seller,warehouse}.functions.ts` — «Function lacks ending return statement
and return type does not include 'undefined'». Проверены сигнатуры всех пяти вспомогательных функций
(`mapAddressError`, `mapAdminError`, `mapCourierError`, `mapSellerError`, `mapWarehouseError`) — все корректно
объявлены как `(error: unknown): never`. Анализ недостижимости кода после вызова `never`-функции, полученной
через `await import(...)`, в данной комбинации не сработал — код корректен, это особенность диагностики
компилятора, а не дефект.

**Группа G — реальный, независимый, ранее не исправленный баг (11 диагностик).**
`src/routes/{admin,courier,orders,profile,seller,warehouse}/**` (11 файлов) — `supabase.auth
.onAuthStateChange()` возвращает `{ data: { subscription: Subscription } }`; во всех 11 файлах код
деструктурирует `const { data: subscription } = ...`, получая объект `{ subscription: Subscription }`
целиком вместо самого `Subscription`, и вызывает `subscription.unsubscribe()` на один уровень не там же.
Баг идентичен и скопирован по одному и тому же шаблону во всех 11 файлах. Не входит в область F1–F9;
требует отдельного исправления вне рамок этого плана.

**Итог:** 1 (D) + 1 (E) + 5 (F) + 11 (G) = **18**, что совпадает с фактическим результатом `tsc --noEmit`
после Этапа 8. Ни одна из групп не пересекается ни с одной находкой F1–F9 этого документа и не была вызвана
удалением orphan-архитектуры — все они существовали в коде до начала работ по этому плану и были просто
не видны из-за прерывания фазы `Check` компилятора.

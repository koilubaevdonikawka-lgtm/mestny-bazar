# Порядок реализации Административной платформы

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | План реализации — главный документ разработки |
| **Дата последнего обновления** | 2026-08-01 |
| **Связанные документы** | все документы `docs/admin-platform/` (см. колонку «Связанные документы» каждого этапа), [`dependency-map.md`](./dependency-map.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md); Этапы 3–4 порождают новые ADR-кандидаты, см. §«Связь с ADR» в [`README.md`](./README.md) |
| **Связанные Architecture Principles** | PL-05 (Composition Root), PL-12 (Rule Engine), POL-14 (Extend, Never Replace) |

---

> Этот документ содержит **исключительно порядок реализации** — номер этапа, цель, что меняется, критерии готовности. Архитектурные решения здесь не принимаются и не пересказываются — только ссылки на документы, где они уже приняты. Если что-то из описанного в этапе не соответствует документу модуля — прав документ модуля, этот файл исправляется.
>
> **Этот документ заменяет собой `implementation-roadmap.md`** (созданный на предыдущем этапе документирования). Причина замены и статус старого файла — в его собственном заголовке и в отчёте по итогам аудита этой ревизии.

## Принцип разбиения

Минимальное число крупных, максимально автономных этапов — **5**, не десятки мелких задач. «Автономный» означает: по завершении этапа платформа (включая уже существующий маркетплейс) находится в полностью рабочем состоянии. Порядок этапов следует карте зависимостей ([`dependency-map.md`](./dependency-map.md)), но группирует модули по эффективности совместной реализации, а не разбивает их по одному модулю на этап.

**Каждый этап обязан:** пройти `typecheck` → `lint` → `tests` → `build` без ошибок и **завершиться отдельным commit**. Ни один этап не считается выполненным при красном статусе хотя бы одной проверки.

---

## Этап 1 — Фундамент Административной платформы

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-01) — typecheck, lint, tests, build пройдены; commit создан |
| **Номер** | 1 |
| **Название** | Фундамент: каркас, права доступа, настройки |
| **Цель** | Дать платформе единую точку входа (навигация, layout), базовый механизм проверки прав (Rule Engine) и инфраструктуру бизнес-настроек, поверх которых строятся все остальные этапы |
| **Связанные документы** | [`ADMIN_PLATFORM_MASTER_SPEC.md`](./ADMIN_PLATFORM_MASTER_SPEC.md), [`permissions.md`](./permissions.md), [`settings.md`](./settings.md), [`README.md`](./README.md) |
| **Какие файлы будут изменяться** | `server/di/container.ts` (wiring); `src/integrations/supabase/types.ts` (типы новой таблицы) |
| **Какие файлы будут создаваться** | `supabase/migrations/<ts>_platform_settings.sql`; `shared/contracts/settings.ts`; `shared/validation/settings.schema.ts`; `server/ports/settings.repository.ts`; `server/ports/permission-policy.port.ts`; `server/adapters/supabase/settings.repository.ts` (+`.test.ts`); `server/domain/permission-policy/{permission-policy.rule.ts, permission-policy-order.ts, permission-policy.service.ts, permission-policy.errors.ts}` (+тест); `server/domain/permission-policy/rules/admin-full-access.rule.ts` (+тест); `server/domain/settings.service.ts` (+тест); `server/functions/settings.executor.ts`; `src/api/settings.functions.ts`; `src/api/settings.ts`; `src/components/admin/AdminLayout.tsx` (общий Layout Административной платформы); `src/routes/admin/index.tsx`; `src/routes/admin/settings/index.tsx` |
| **Какие модули будут создаваться** | Права доступа (базовая версия — только правило `AdminFullAccessRule`, без под-ролей); Настройки (инфраструктура — CRUD, без миграции конкретных хардкодов других модулей); каркас навигации Административной платформы (`/admin`) |
| **Какие API будут использоваться** | Новые: `listSettingsFn` (GET), `getSettingFn` (GET), `updateSettingFn` (POST) — все проходят `requireAdminFromRequest()`, затем `permissionPolicy.assert()`. Существующие, переиспользуемые без изменений: `requireAdminFromRequest()` (`server/auth/resolve-user.ts`), `useSupabaseSession()` (фронтенд), существующий `/admin/orders` как первая функциональная ссылка в новой навигации |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | `/admin` открывается, показывает навигацию по всем модулям из мастер-спецификации (§4) — рабочие ссылки только на «Заказы» и «Настройки», остальные — видимые, но неактивные заглушки (не битые ссылки на несуществующее); `/admin/settings` читает и пишет `platform_settings` через `SettingsService` → `ISettingsRepository`, не напрямую; `PermissionPolicyService` реально вызывается на пути `settings.executor.ts`, а не просто существует неиспользуемым; ни один customer-facing путь и ни один уже существующий admin-путь (`/admin/orders/*`) не изменён |
| **Commit** | Один commit по завершении этапа, охватывающий каркас + Permission Policy (база) + Settings (инфраструктура) |

---

## Этап 2 — Ядро операционного управления

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-01) — typecheck, lint, tests, build пройдены; commit создан |
| **Номер** | 2 |
| **Название** | Dashboard, Заказы, Каталог, Склад |
| **Цель** | Дать персоналу управление уже существующим ядром маркетплейса (заказы, товары, остатки) через интерфейс, без прямых правок в БД |
| **Связанные документы** | [`dashboard.md`](./dashboard.md), [`orders.md`](./orders.md), [`catalog.md`](./catalog.md), [`warehouse.md`](./warehouse.md), [`platform-lifecycle.md`](./platform-lifecycle.md) |
| **Какие файлы будут изменяться** | `src/routes/admin/index.tsx` (активация ссылок на Dashboard/Каталог/Склад); `server/di/container.ts`; `src/routes/admin/orders/{index,$id}.tsx` (индикатор буфера отмены — `CancellationWindowBadge`); все места, публикующие статус-переходы заказа (`server/domain/admin-order.service.ts`, `warehouse-order.service.ts`, `courier-order.service.ts` — добавление `events.publish`); `server/adapters/supabase/order.repository.ts` и `server/ports/order.repository.ts` (`countByStatuses`/`getTodaySummary` — Dashboard KPI); `server/ports/marketplace-events.port.ts` и `server/ports/audit-log.port.ts` (новые типы событий); `server/domain/marketplace-events/notification-center.subscriber.ts` (подписка перенесена с `order.created` на `order.operational_cascade_started`); `server/domain/audit-log/marketplace-events.subscriber.ts` (подписка на новые типы событий); `src/integrations/supabase/types.ts` (новые таблица/колонка); `src/routes/warehouse/orders/{index,$id}.tsx` (перевод на общий `AdminLayout` + возврат в `/admin` — интеграция Warehouse Workspace в общий каркас Административной платформы, ADMIN_PLATFORM_MASTER_SPEC.md §3); `src/routes/admin/warehouse/index.tsx` (ссылка на очередь сборки) |
| **Какие файлы будут создаваться** | `supabase/migrations/{<ts>_low_stock_thresholds,<ts>_order_operational_cascades}.sql`; `shared/contracts/{category-admin,stock,dashboard}.ts`; `shared/validation/{category-admin,stock}.schema.ts`; `server/ports/{category-admin.repository,stock.repository,stock-policy.port,order-cascade.repository}.ts`; `server/domain/stock-policy/*` (Rule Engine по стандарту PL-12); `server/domain/order-lifecycle-cascade.service.ts` (буфер-как-гейт, идемпотентный lazy sweep — на платформе нет cron/scheduler); `server/domain/{category-admin,stock-admin,dashboard}.service.ts` (+errors, +тесты); `server/adapters/supabase/{category-admin.repository,stock.repository,order-cascade.repository}.ts` (+тесты маппера); `server/functions/{category-admin,warehouse-admin,dashboard}.executor.ts`; `src/api/{category-admin,warehouse-admin,dashboard}.{functions.ts,ts}`; `src/components/admin/CancellationWindowBadge.tsx`; `src/routes/admin/{dashboard,catalog,warehouse}/index.tsx` |
| **Какие модули будут создаваться** | Dashboard (KPI-карточки + «Требует внимания» + очередь склада — опрос, не live-события); Каталог (создание/редактирование категорий — сегодня только чтение; товары/модерация — не в этом этапе); Склад (пороги, ручная корректировка остатка); буфер-как-гейт для операционного каскада (`orders.md`, `platform-lifecycle.md` §3) |
| **Какие API будут использоваться** | Новые: `listAdminCategoriesFn`/`createCategoryFn`/`updateCategoryFn`, `listStockFn`/`adjustStockFn`/`setStockThresholdFn`, `getDashboardSummaryFn`. Существующие, переиспользуемые: `AdminOrderService`, `WarehouseOrderService`, `CatalogService`, `InventoryService`, `IMarketplaceEventBus` |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | Администратор и склад полностью управляют заказами/каталогом/остатками через Административную платформу; буфер отмены измеримо задерживает уведомление персонала (`NotificationCenter` подписан на `order.operational_cascade_started`, не на `order.created`) и операционное резервирование (не учётное — оно остаётся синхронным на чекауте, см. `platform-lifecycle.md`) |
| **Commit** | Один commit по завершении этапа |
| **Известные ограничения (честно задокументированы, не обойдены суррогатно)** | Dashboard: «Заказы в реальном времени» и «Активность курьеров» не реализованы — первое требует live-доставки событий в браузер (не задокументирована ни в одном модуле), второе требует домена назначения курьера (Этап 3, `couriers.md`, §9.3). KPI-карточки Dashboard пока статичны (не ссылки с применённым фильтром, как описано в `dashboard.md`) — переход по клику потребовал бы расширения `OrderListParams` фильтром по статусу, не входящего в список API Этапа 2; отложено, не подменено фиктивной ссылкой без фильтра. Каталог: только категории, без модерации товаров (`AdminForceHideRule` не в списке API Этапа 2). Склад: `listStockFn`/`adjustStockFn` защищены `requireWarehouseFromRequest()` — Admin не наследует доступ Warehouse автоматически, как и в уже существующем `warehouse.executor.ts` (Этап 1); не новый пробел, не устранён в этом этапе. Буфер-каскад: без cron/scheduler в проекте реализован как ленивый идемпотентный sweep при чтении заказов админом (`AdminOrderService.listOrders/getOrder`), не как фоновый таймер |

---

## Этап 3 — Участники платформы

| Поле | Значение |
|---|---|
| **Номер** | 3 |
| **Название** | Продавцы, Поставщики, Покупатели, Курьеры |
| **Цель** | Дать платформе полноценные сущности для всех участников и закрыть главный технический долг, найденный аудитом, — отсутствие привязки заказа к курьеру |
| **Связанные документы** | [`sellers.md`](./sellers.md), [`suppliers.md`](./suppliers.md), [`users.md`](./users.md), [`couriers.md`](./couriers.md) |
| **Какие файлы будут изменяться** | `shared/contracts/order.ts` (добавление `assignedCourierId`); `server/adapters/supabase/order.{repository,mapper}.ts`; `server/domain/courier-order.service.ts` (`acceptOrder()` начинает персистить); `server/di/container.ts`; `src/routes/admin/index.tsx` |
| **Какие файлы будут создаваться** | `supabase/migrations/<ts>_seller_profile.sql`, `<ts>_suppliers.sql`, `<ts>_order_courier_assignment.sql`; `shared/contracts/{seller-profile,supplier}.ts`; `server/domain/courier-assignment/*` (Rule Engine); `server/domain/payment-policy/rules/blocked-user.rule.ts`; `server/ports/supplier.repository.ts` + `server/adapters/supabase/supplier.repository.ts`; `server/functions/{seller-profile,supplier,courier-admin}.executor.ts`; `src/api/{seller-profile,supplier,courier-admin}.{functions.ts,ts}`; `src/routes/admin/{sellers,suppliers,users,couriers}/*.tsx` |
| **Какие модули будут создаваться** | Продавцы (профиль, верификация); Поставщики (новый домен целиком); Покупатели (блокировка); Курьеры (автоподбор, персистентное назначение) |
| **Какие API будут использоваться** | Новые: CRUD по продавцам/поставщикам, `blockCustomerFn`, `assignCourierFn`. Существующие: `SellerProductService`, `CourierOrderService`, `PaymentPolicyService` (расширяется новым правилом), `OrderLifecycleService` |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | У платформы есть сущности продавца/поставщика; курьер назначается автоматически на конкретный заказ, а не разбирает общую очередь; изменение контракта `OrderDTO` не сломало ни один существующий потребитель (customer storefront, предыдущие этапы) |
| **Commit** | Один commit по завершении этапа |

---

## Этап 4 — Деньги, рост, аналитика

| Поле | Значение |
|---|---|
| **Номер** | 4 |
| **Название** | Аналитика, Финансы, Маркетинг, Оформление |
| **Цель** | Дать администратору понимание динамики платформы и инструменты роста, поверх операционных данных, накопленных на Этапах 2–3 |
| **Связанные документы** | [`analytics.md`](./analytics.md), [`finance.md`](./finance.md), [`marketing.md`](./marketing.md), [`design.md`](./design.md) |
| **Какие файлы будут изменяться** | `server/domain/pricing.service.ts` (встраивание `DiscountPolicyService`); `src/routes/index.tsx` (замена `KG_NAME_BY_SLUG`/`FALLBACK_IMAGE_BY_SLUG` на чтение из `Оформление`/`image_url`); `server/di/container.ts` |
| **Какие файлы будут создаваться** | `supabase/migrations/<ts>_coupons.sql`, `<ts>_seller_payouts.sql`; `shared/contracts/{coupon,payout}.ts`; `server/domain/discount-policy/*` (Rule Engine); `server/domain/commission-policy/*` (Rule Engine); `server/domain/analytics.service.ts` (read-only агрегатор); `server/functions/{marketing,finance,analytics}.executor.ts`; `src/api/{marketing,finance,analytics}.{functions.ts,ts}`; `src/routes/admin/{analytics,finance,marketing,design}/*.tsx` |
| **Какие модули будут создаваться** | Аналитика (read-only агрегаты по Заказам/Каталогу/Покупателям); Финансы (выплаты, комиссия — без сверки с Finik); Маркетинг (купоны/акции); Оформление (управление контентом витрины) |
| **Какие API будут использоваться** | Новые: `getSalesAnalyticsFn`, `listPayoutsFn`, CRUD по купонам, CRUD по баннерам/категорийным изображениям. Существующие: `PricingService`, `CatalogService` (запись `image_url`), `CategoryService` |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | Администратор видит динамику продаж, управляет акциями и оформлением витрины; выплаты продавцам считаются автоматически (без сверки с провайдером — явно помечено как заблокированное, не обойдено суррогатным решением) |
| **Commit** | Один commit по завершении этапа |

---

## Этап 5 — Наблюдаемость и автоматизация

| Поле | Значение |
|---|---|
| **Номер** | 5 |
| **Название** | Автоматизация, Интеграции, AI, Безопасность, Журналы |
| **Цель** | Сделать платформу полностью наблюдаемой и свести воедино автоматические процессы, введённые на предыдущих этапах |
| **Связанные документы** | [`automation.md`](./automation.md), [`integrations.md`](./integrations.md), [`ai.md`](./ai.md), [`security.md`](./security.md), [`logs.md`](./logs.md) |
| **Какие файлы будут изменяться** | `server/di/container.ts` (перепривязка `subscribeAIWorkers` с `order.created` на `product.published`); `server/domain/audit-log/marketplace-events.subscriber.ts` (расширение покрытия); все executor'ы предыдущих этапов (публикация недостающих событий) |
| **Какие файлы будут создаваться** | `server/domain/automation-overview.service.ts`; `server/functions/{automation,integrations-status,security-overview}.executor.ts`; `src/api/{automation,integrations-status,security-overview}.{functions.ts,ts}`; `src/routes/admin/{automation,integrations,ai,security,logs}/*.tsx` |
| **Какие модули будут создаваться** | Автоматизация (обзор событий/подписчиков); Интеграции (статус, без редактирования секретов); AI (обзор результатов анализа — при условии, что Этап 2/4 подключили хранение); Безопасность (обзор периметра); Журналы (полноценный UI поверх уже существующего `audit_log`) |
| **Какие API будут использоваться** | Новые: `getAutomationOverviewFn`, `getIntegrationsStatusFn`, `getSecurityOverviewFn`, `listAuditLogFn`. Существующие: `IMarketplaceEventBus`, `SupabaseAuditLog`, `AIWorkerRegistry`/`AIOrchestrator` |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | Ни одно значимое действие платформы не происходит «молча» (без события/записи в журнале); AI-анализ запускается на публикацию товара, не на каждый заказ; администратор видит статус безопасности и интеграций в одном месте |
| **Commit** | Один commit по завершении этапа |

---

## Сводная таблица

| № | Этап | Модули | Ключевая зависимость (по `dependency-map.md`) |
|---|---|---|---|
| 1 | Фундамент | Права доступа (база), Настройки (инфраструктура), каркас | Нет — корень |
| 2 | Ядро операционного управления | Dashboard, Заказы, Каталог, Склад | Этап 1 |
| 3 | Участники платформы | Продавцы, Поставщики, Покупатели, Курьеры | Этапы 1–2 |
| 4 | Деньги, рост, аналитика | Аналитика, Финансы, Маркетинг, Оформление | Этапы 1–3 |
| 5 | Наблюдаемость и автоматизация | Автоматизация, Интеграции, AI, Безопасность, Журналы | Этапы 1–4 |

## Итоговое условие

```
Этап N считается закрытым только при:
  typecheck ✅  →  lint ✅  →  tests ✅  →  build ✅  →  commit
```

Без исключений. Этап не начинается, пока предыдущий не закрыт этим условием — это и есть смысл «максимально автономного» этапа: он не оставляет систему в состоянии, из которого нельзя откатиться или остановиться.

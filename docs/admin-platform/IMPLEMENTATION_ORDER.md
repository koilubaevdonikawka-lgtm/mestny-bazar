# Порядок реализации Административной платформы

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | План реализации — главный документ разработки |
| **Дата последнего обновления** | 2026-08-02 |
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
| **Статус этапа** | ✅ Выполнен (2026-08-02) — typecheck, lint, tests (592 passed), build пройдены; commit создан |
| **Номер** | 3 |
| **Название** | Продавцы, Поставщики, Покупатели, Курьеры, Роли и права доступа |
| **Цель** | Дать платформе полноценные сущности для всех участников, закрыть главный технический долг — отсутствие привязки заказа к курьеру — и дать автоматизацию управления ролями (permissions.md), не только доменные сущности |
| **Связанные документы** | [`sellers.md`](./sellers.md), [`suppliers.md`](./suppliers.md), [`users.md`](./users.md), [`couriers.md`](./couriers.md), [`permissions.md`](./permissions.md) |
| **Какие файлы будут изменяться** | `shared/contracts/order.ts` (добавление `assignedCourierId`); `server/adapters/supabase/order.{repository,mapper}.ts` + `server/ports/order.repository.ts` (`assignCourier`, `countActiveDeliveriesByCourier`, `listByStatusesForCourier`); `server/domain/courier-order.service.ts` (`acceptOrder()` персистит, `listDeliveryOrders()` фильтрует по назначенному курьеру); `server/domain/{admin-order,warehouse-order}.service.ts` не тронуты по сути, только сигнатуры; `server/domain/order-lifecycle-cascade.service.ts` (опциональная попытка авто-назначения курьера в том же lazy sweep); `server/domain/checkout.service.ts` + `server/ports/payment-policy.port.ts` (`isBlocked`); `server/ports/product.repository.ts` + adapters (`increaseStock`, переиспользует `release_product_stock`); `server/domain/audit-log/marketplace-events.subscriber.ts`, `server/ports/{marketplace-events,audit-log}.port.ts` (новые события); `server/di/container.ts`; `src/integrations/supabase/types.ts`; `src/routes/admin/index.tsx`; `src/routes/warehouse/orders/{index,$id}.tsx` не тронуты в этом этапе (см. известные ограничения) |
| **Какие файлы будут создаваться** | `supabase/migrations/{<ts>_seller_profile,<ts>_suppliers,<ts>_order_courier_assignment,<ts>_customer_blocking,<ts>_admin_scopes}.sql`; `shared/contracts/{seller-profile,supplier,courier-status,user-admin}.ts`; `shared/validation/{seller-profile,supplier,courier-status,user-admin}.schema.ts`; `server/domain/courier-assignment/*` (Rule Engine — `CourierAssignmentPolicyService`, `LeastLoadedAvailableCourierRule`) + `server/domain/courier-assignment.service.ts` (оркестратор); `server/domain/payment-policy/rules/blocked-user.rule.ts`; `server/domain/permission-policy/rules/{admin-finance-scope,admin-marketing-scope}.rule.ts`; `server/domain/{seller-profile,supplier,supply,user-admin,courier-admin,courier-status}.service.ts` (+errors, +тесты); `server/ports/{seller-profile.repository,supplier.repository,supply.repository,courier-status.repository,customer-status.repository,user-admin.repository,courier-assignment.port}.ts`; `server/adapters/supabase/{seller-profile,supplier,supply,courier-status,customer-status,user-admin}.repository.ts` (+тесты маппера); `server/functions/{seller-profile,supplier,user-admin,courier-admin}.executor.ts`; `src/api/{seller-profile,supplier,user-admin,courier-admin}.{functions.ts,ts}`; `src/routes/admin/{sellers,suppliers,users,couriers}/index.tsx`; `src/routes/seller/profile/index.tsx` |
| **Какие модули будут создаваться** | Продавцы (профиль, верификация — простой явный переход, не полный Rule Engine); Поставщики (новый домен целиком — поставщики, заявки, приёмка с увеличением остатка через `InventoryService`); Покупатели (блокировка — `BlockedUserRule` в `PaymentPolicyService`); Курьеры (авто-подбор через Rule Engine + персистентное назначение, статус доступности); Роли и права (назначение ролей любому пользователю, admin-finance/admin-marketing scope через `admin_scopes`, не новые значения `UserRole`) |
| **Какие API будут использоваться** | Новые: CRUD по продавцам/поставщикам, `listUsersFn`/`assignRoleFn`/`revokeRoleFn`/`assignAdminScopeFn`/`revokeAdminScopeFn`/`setCustomerBlockedFn`, `listCouriersFn`/`assignCourierFn` (ручной повторный запуск), `setCourierAvailabilityFn`. Существующие: `SellerProductService`, `CourierOrderService`, `PaymentPolicyService` (расширяется `BlockedUserRule`), `OrderLifecycleService`, `PermissionPolicyService` (расширяется scope-правилами), `InventoryService` (расширяется `increaseStock`) |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | У платформы есть сущности продавца/поставщика; курьер назначается автоматически на конкретный заказ (при истечении буфера отмены, тот же lazy sweep, что и операционный каскад), а не разбирает общую очередь — `CourierOrderService.listDeliveryOrders()` фильтрует по `assignedCourierId`; изменение контракта `OrderDTO` не сломало ни один существующий потребитель; блокировка покупателя реально запрещает оформление заказа через `BlockedUserRule`; назначение ролей/scope происходит через UI/API, не прямые правки БД |
| **Commit** | Один commit по завершении этапа |
| **Известные ограничения (честно задокументированы, не обойдены суррогатно)** | Seller Workspace (`src/routes/seller/*`) всё ещё не переведён на общий `AdminLayout` — тот же класс несоответствия §3 мастер-спецификации, что был найден и исправлен для Warehouse Workspace в Этапе 2, но здесь оставлен как известный, не устранённый в этом этапе пробел (не входил в явно названные файлы Этапа 3). Автоматический выбор поставщика по сигналу `stock.low` не реализован — открытый продуктовый вопрос (нет модели «товар → поставщик»), явно зафиксированный в `suppliers.md`; поддерживается только ручное создание заявки. `/admin/couriers` показывает список и нагрузку, но не строит карту «какой заказ у какого курьера прямо сейчас» и не предоставляет UI для ручного `assignCourierFn` — API существует, отдельный виджет не построен. Критерии верификации продавца и подбора курьера — простые явные реализации (не многошаговые Rule Engine с несколькими правилами), как прямо разрешают `sellers.md` и `couriers.md` для первого прохода. |

---

## Этап 4 — Деньги, рост, аналитика

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-02) — typecheck, lint, tests (629 passed), build пройдены; commit создан |
| **Номер** | 4 |
| **Название** | Аналитика, Финансы, Маркетинг, Оформление |
| **Цель** | Дать администратору понимание динамики платформы и инструменты роста, поверх операционных данных, накопленных на Этапах 2–3 |
| **Связанные документы** | [`analytics.md`](./analytics.md), [`finance.md`](./finance.md), [`marketing.md`](./marketing.md), [`design.md`](./design.md) |
| **Какие файлы будут изменяться** | `server/domain/pricing.service.ts` (`calculateTotal` — необязательный параметр `discount`); `server/domain/checkout.service.ts` (валидация и применение купона перед созданием заказа, погашение купона после); `shared/contracts/{order,catalog,category-admin}.ts` (`couponCode`/`discountAmount`/`nameKg`); `shared/validation/{order,category-admin}.schema.ts`; `server/ports/{order.repository,marketplace-events.port,audit-log.port,permission-policy.port}.ts` (`listInPeriod`, новые события `coupon.*`/`payout.*`/`content.published`); `server/adapters/supabase/{order.repository,order.mapper,category.repository,category-admin.repository}.ts`; `server/domain/audit-log/marketplace-events.subscriber.ts`; `server/di/container.ts`; `src/integrations/supabase/types.ts` (новые таблицы/колонки); `src/routes/index.tsx` (`c.nameKg ?? KG_NAME_BY_SLUG[c.slug]`, `FALLBACK_IMAGE_BY_SLUG` не тронут — уже был DB-first; активный баннер в Hero); `src/routes/admin/{index,catalog}/index.tsx` |
| **Какие файлы будут создаваться** | `supabase/migrations/{<ts>_coupons,<ts>_seller_payouts,<ts>_category_name_kg,<ts>_banners,<ts>_orders_discount}.sql`; `shared/contracts/{coupon,payout,banner,analytics}.ts`; `shared/validation/{coupon,payout,banner,analytics}.schema.ts`; `server/ports/{coupon.repository,payout.repository,banner.repository,commission-policy.port,discount-policy.port}.ts`; `server/domain/analytics.service.ts` (+тест); `server/domain/commission-policy/*` (Rule Engine, +тест) `server/domain/discount-policy/*` (Rule Engine, +тесты правил); `server/domain/{payout,coupon,banner}.service.ts` (+errors, +тесты); `server/adapters/supabase/{coupon,payout,banner}.repository.ts` (+тесты маппера); `server/functions/{analytics,finance,marketing,design}.executor.ts`; `src/api/{analytics,finance,marketing,design}.{functions.ts,ts}`; `src/routes/admin/{analytics,finance,marketing,design}/index.tsx` |
| **Какие модули будут создаваться** | Аналитика (read-only агрегаты по Заказам — выручка/число заказов/средний чек/топ товаров; Покупатели/Курьеры/Экспорт — отложено); Финансы (расчёт выплат продавцам и комиссии платформы через `CommissionPolicyService`; сверка с Finik заблокирована, как и задокументировано в `finance.md`); Маркетинг (купоны — CRUD + серверная валидация/расчёт скидки через `DiscountPolicyService`, встроенный в `CheckoutService`); Оформление (`categories.name_kg` — заменяет `KG_NAME_BY_SLUG`; баннеры главной страницы — новая, полностью аддитивная сущность) |
| **Какие API будут использоваться** | Новые: `getSalesAnalyticsFn`, `getFinanceOverviewFn`/`listPayoutsFn`/`listMyPayoutsFn`/`createPayoutRunFn`/`completePayoutFn`, `listCouponsFn`/`createCouponFn`/`updateCouponFn`, `listActiveBannersFn`/`listBannersFn`/`createBannerFn`/`updateBannerFn`. Существующие: `PricingService`, `CheckoutService`, `CategoryAdminService`/`updateCategoryFn` (расширены полем `nameKg`, ранее существовали без UI-редактора `image_url`/`nameKg` — теперь есть), `PermissionPolicyService` (модули `analytics`/`finance`/`marketing`/`design` — правила `AdminFinanceScopeRule`/`AdminMarketingScopeRule` существовали с Этапа 3 без модулей, которые могли бы их использовать) |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build |
| **Критерии готовности** | Администратор видит динамику продаж (заказы/выручка/средний чек/топ товаров за период); купоны создаются и валидируются/применяются сервером при оформлении заказа, а не на клиенте (CD-01); выплаты продавцам считаются автоматически по формуле `валовая выручка − комиссия` (комиссия — Rule Engine, ставка по умолчанию с возможностью переопределения через Settings), без сверки с провайдером — явно помечено как заблокированное (`finik.adapter.ts` — заглушка), не обойдено суррогатным решением; кыргызские названия категорий читаются из БД (`name_kg`) с откатом на прежний хардкод, если поле не заполнено — нулевая визуальная регрессия |
| **Commit** | Один commit по завершении этапа |
| **Известные ограничения (честно задокументированы, не обойдены суррогатно)** | На витрине нет поля ввода кода купона — бэкенд полностью реализован и покрыт тестами (валидация, расчёт скидки, погашение), но реальный покупатель пока не может подставить купон иначе как через API; аналогичный паттерн уже применялся к некликабельным KPI-карточкам Dashboard в Этапе 2. Аналитика ограничена Заказами (выручка/число заказов/средний чек/топ товаров за период) — аналитика по Покупателям, Курьерам (время доставки) и CSV-экспорт отложены как заявленное в `analytics.md` будущее расширение; агрегация выполняется на лету по всем заказам периода без materialized views — сознательно принято на текущем масштабе платформы, точный механизм периодической агрегации `analytics.md` явно оставляет открытым инженерным решением. Финансы: сверка платежей с Finik заблокирована (интеграция не завершена); ставка комиссии — плоская (одно правило `FlatCommissionRule`), персональные/категорийные ставки — будущее расширение, как прямо разрешает `finance.md` для первого прохода. Оформление: сезонные темы и редактируемые тексты интерфейса (`design.md`) не реализованы — только баннеры и `name_kg`/`image_url` категорий, явно названные в списке файлов Этапа 4. `FALLBACK_IMAGE_BY_SLUG` в `src/routes/index.tsx` сознательно не удалён — `c.imageUrl || FALLBACK_IMAGE_BY_SLUG[c.slug]` уже был DB-first до этого этапа; реальный пробел был в отсутствии админ-UI для `image_url`, который теперь закрыт расширенной формой `/admin/catalog`. |

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

# Порядок реализации — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | План реализации — главный документ разработки модуля |
| **Дата последнего обновления** | 2026-08-02 (Этап 3 закрыт — аудит, полировка, Courier Platform readiness) |
| **Связанные документы** | все документы `docs/delivery/`, [`docs/admin-platform/IMPLEMENTATION_ORDER.md`](../admin-platform/IMPLEMENTATION_ORDER.md), [`docs/architecture/ARCHITECTURE_GUARD.md`](../architecture/ARCHITECTURE_GUARD.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md); см. [`delivery-future-roadmap.md`](./delivery-future-roadmap.md) для кандидатов, необходимых до Этапа 3 |
| **Связанные Architecture Principles** | PL-05 (Composition Root), PL-12 (Rule Engine), PL-14 (ADR) |

---

> Этот документ содержит **исключительно порядок реализации** — по тому же принципу, что уже принят для `docs/admin-platform/IMPLEMENTATION_ORDER.md`: номер этапа, цель, что меняется, критерии готовности. Архитектурные решения здесь не принимаются — только ссылки на документы, где они уже приняты.

## Принцип разбиения

Три автономных этапа, явно заданных Промптом №020: **Архитектура → Реализация ядра → Продвинутое ценообразование**. «Автономный» — по завершении этапа платформа находится в полностью рабочем состоянии, ничего не оставлено наполовину.

**Каждый этап обязан пройти ту же последовательность, что уже обязательна для Административной платформы** (`docs/admin-platform/IMPLEMENTATION_ORDER.md`, «Принцип разбиения»):

```
1. Реализация этапа
2. typecheck
3. lint
4. tests
5. build
6. Architecture Guard (npm run guard + ручной чек-лист ARCHITECTURE_GUARD.md §3)
      PASS → разрешён шаг 7
      FAIL → commit запрещён
7. git commit
8. Обновление IMPLEMENTATION_ORDER.md (этого документа)
9. Финальный отчёт
```

Ни один этап не считается выполненным при красном статусе хотя бы одной проверки.

---

## Этап 1 — Архитектура и фундамент

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-02) — typecheck, lint, tests, build, Architecture Guard пройдены; commit создан |
| **Номер** | 1 |
| **Название** | Архитектура и фундамент |
| **Цель** | Спроектировать доменную модель, Rule Engine, модель событий и контур API модуля Delivery Management & Pricing, полностью соответствующие `ARCHITECTURE_BASELINE_V1.md`, без единой строки исполняемого кода |
| **Связанные документы** | все документы `docs/delivery/`, созданные этим этапом |
| **Какие файлы изменялись** | `docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md` (добавлен модуль в навигацию/список — если применимо, см. финальный отчёт), `docs/admin-platform/IMPLEMENTATION_ORDER.md` (примечание о новом, отдельном модуле) |
| **Какие файлы создавались** | `docs/delivery/{README,DELIVERY_MASTER_SPEC,delivery-zones,delivery-pricing,delivery-rule-engine,delivery-events,delivery-api,delivery-future-roadmap,IMPLEMENTATION_ORDER,dependency-map}.md` |
| **Какие модули проектировались** | City, Store, Delivery Zone, District (география); Delivery Tariff, Delivery Coefficient, Delivery Pricing Engine, Delivery Calculator (цена); Delivery Zone Policy, Delivery Tariff Policy (Rule Engine); Delivery Event Model |
| **Какой код создавался** | Никакой — запрещено явно этим этапом |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build, Architecture Guard |
| **Критерии готовности** | Все 10 документов `docs/delivery/` существуют и внутренне непротиворечивы; Rule Engine соответствует `docs/principles/12-rule-engine-standard.md` без исключений; ни один инвариант `ARCHITECTURE_BASELINE_V1.md` не нарушен; ни одного файла кода/миграции/UI не создано |
| **Commit** | Один commit по завершении этапа |

---

## Этап 2 — Реализация ядра

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-02) — typecheck, lint, tests (671 passed), build, Architecture Guard (PASS) пройдены; commit создан |
| **Номер** | 2 |
| **Название** | Реализация ядра: география, стандартные тарифы, Rule Engine, интеграция с Checkout |
| **Цель** | Дать платформе рабочую, конфигурируемую через Административную платформу систему зон и тарифов (включая CORPORATE/HOLIDAY/PROMOTIONAL как модель данных и работающие правила выбора), заменяющую сегодняшний `SupabaseDeliveryZoneRepository.calculateFee()`, без активации продвинутого ценообразования (расстояние, коэффициенты) |
| **Что реализовано** | Миграции: `cities`/`stores` (+ seed «Бишкек»), `delivery_zones` (расширен `city_id`/`store_id`, `price`/`free_from` перенесены в тариф), `delivery_districts` (только схема — см. «Известные ограничения»), `delivery_tariffs`, снимок `orders.delivery_tariff_id`/`delivery_eta_min_minutes`/`delivery_eta_max_minutes`; порты и Supabase-адаптеры для City (read-only)/Zone (buyer + admin)/Tariff; два Rule Engine (`DeliveryZonePolicyService`, `DeliveryTariffPolicyService`) с полным набором правил из `delivery-rule-engine.md`; `DeliveryCalculator` (FIXED/BY_ZONE/BY_DISTANCE-формула, свободная доставка, ETA); `DeliveryPricingEngine`-оркестратор; `DeliveryZoneAdminService`/`DeliveryTariffAdminService` (CRUD + события); API (buyer: `listDeliveryZonesFn`, `calculateDeliveryFeeFn`; admin: полный CRUD зон/тарифов, `previewDeliveryFeeFn`); `/admin/delivery` (список/создание/деактивация зон, CRUD тарифов, обзор правил, калькулятор предпросмотра); `PricingService`/`CheckoutService` переведены на `DeliveryPricingEngine` (единственный путь расчёта, `IDeliveryZoneRepository.calculateFee()` удалён как дублирующий); Покупательское PWA — выбор зоны в адресе (гость и авторизованный), отображение стоимости/ETA/прогресса до бесплатной доставки в корзине, ETA на странице заказа |
| **Явно НЕ входит в объём (перенесено в Этап 3, как и планировалось)** | `pricingModel: BY_DISTANCE` — формула реализована и покрыта тестами, но `distanceKm` всегда `undefined` (нет провайдера геокодирования, ADR-кандидат №1); `DeliveryCoefficient`/`DeliveryCoefficientRegistry` — не реализованы вовсе (ADR-кандидат №3); события `delivery.tariff.activated`/`.expired` — не реализованы (открытый вопрос `delivery-events.md`); автоматическое сопоставление адреса с районом (`DeliveryZoneService.resolveZoneForAddress`) — покупатель выбирает зону вручную, как и было спроектировано как «резервный путь» в `delivery-zones.md` |
| **Известные ограничения (честно задокументированы)** | `delivery_districts` существует только как таблица — ни Repository, ни Service, ни UI для неё не созданы (не входило в явный список UI Промпта №021); Store (`stores`) аналогично — только схема, `storeId` всегда `null` на всех зонах; найденный при реализации порядок шагов `DeliveryPricingEngine` (Tariff Policy до Zone Policy) исправлен относительно черновика Этапа 1, см. `delivery-pricing.md` |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build, Architecture Guard |
| **Commit** | Один commit по завершении этапа |

---

## Этап 3 — Аудит, полировка и подготовка к Courier Platform

| Поле | Значение |
|---|---|
| **Статус этапа** | ✅ Выполнен (2026-08-02) — typecheck, lint, tests (672 passed), build, Architecture Guard (PASS) пройдены; commit создан |
| **Номер** | 3 |
| **Название** | Финальная полировка, интеграция и подготовка к Courier Platform (Промпт №022) |
| **Важное расхождение с черновиком Этапа 1:** первоначальный план (см. ниже, «Что НЕ было в объёме Этапа 3») называл Этап 3 «Продвинутым ценообразованием» (расстояние, коэффициенты). Промпт №022 явно переопределил содержание Этапа 3 как CTO-аудит + устранение технического долга + подготовку к Courier Platform — **не** активацию `BY_DISTANCE`/коэффициентов. Это решение пользователя, зафиксированное здесь, а не отклонение от него. | |
| **Цель** | Полный аудит реализации Этапа 2 (Domain Boundaries, Ports, Adapters, DTO, Rule Engine, Repository, DI, Marketplace Events, Checkout, Buyer PWA, Admin Platform, документация, dependency-map, импорты, мёртвый код, дублирование), проверка интеграции с 16 существующими модулями, подготовка данных для будущей Courier Platform |
| **Что найдено и исправлено** | (1) `server/functions/city.executor.ts` обращался к `ICityRepository` в обход Domain — создан `CityService`, обход устранён. (2) `DeliveryZoneService.getById()` — 0 вызывающих кодов, мёртвый метод, удалён. (3) Документация (`DELIVERY_MASTER_SPEC.md` §5) заявляла, что тарифы Admin-Marketing проверяются через `AdminMarketingScopeRule`, но `delivery-tariff.executor.ts` не вызывал `permissionPolicy.assert()` вовсе — исправлено (модуль `"delivery"` добавлен в `MARKETING_ALLOWED_MODULES`, проверка вживую подключена, тест добавлен); документация скорректирована под фактическую (модульную, не по-типу-тарифа) грануляцию. (4) `ADMIN_PLATFORM_MASTER_SPEC.md` §8 (сводная матрица доступа) не содержала строки «Доставка» — добавлена. (5) `AutomationOverviewService`'s статический `EVENT_CATALOG` не содержал 5 новых `delivery.*` событий — добавлены. (6) Административная панель `/admin/delivery` не позволяла редактировать уже созданные зоны/тарифы (только переключение `isActive`) — добавлено полноценное редактирование (Create+Read+Update+soft-Delete). |
| **Courier Platform readiness — проверено** | `OrderDTO` уже несёт `zoneId`/`deliveryTariffId`/`deliveryEtaMinMinutes`/`deliveryEtaMaxMinutes` (снимок Этапа 2); `CourierOrderService.listDeliveryOrders/getOrder/acceptOrder/...` возвращают полный `OrderDTO` без урезания полей — будущая Courier Platform может читать эти поля напрямую, без изменения архитектуры. Недостающих данных не обнаружено — новых полей не потребовалось. |
| **Честно задокументированное, не устранённое ограничение** | `customerSegment: "CORPORATE"` нигде не передаётся из реального запроса (`CheckoutService`/`calculateDeliveryFeeFn`) — `CorporateTariffRule` реализован и протестирован, но недостижим на практике, пока не появится источник признака «корпоративный клиент» (отдельное продуктовое решение, вне объёма этого модуля) — см. `DELIVERY_MASTER_SPEC.md` §6, пункт 5. |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build, Architecture Guard |
| **Commit** | Один commit по завершении этапа |

### Что НЕ было в объёме Этапа 3 (первоначальный план, остаётся не реализованным)

`pricingModel: BY_DISTANCE` (формула реализована с Этапа 2, но `distanceKm` всегда `0` — нет провайдера геокодирования), `DeliveryCoefficient`/`DeliveryCoefficientRegistry` (не реализован вовсе), события `delivery.tariff.activated`/`.expired` (открытый вопрос из `delivery-events.md`), реальный источник `customerSegment`. Все явно требуют кандидатов на ADR №1/№2/№3 (`delivery-future-roadmap.md`) и отдельного, явно поставленного промпта — не считаются частью «модуль полностью завершён» в смысле изначального трёхэтапного плана, но **не блокируют** промышленную эксплуатацию текущего, полностью функционального ядра (см. финальное заключение).

---

## Сводная таблица

| № | Этап | Статус | Ключевая зависимость |
|---|---|---|---|
| 1 | Архитектура и фундамент | ✅ Выполнен | Нет — корень |
| 2 | Реализация ядра | ✅ Выполнен | Этап 1 |
| 3 | Аудит, полировка, Courier Platform readiness | ✅ Выполнен | Этап 2 |
| — | Динамическое ценообразование (расстояние/коэффициенты) | Не начато, требует нового промпта + ADR №1/№2/№3 | Этап 3 |

## Итоговое условие

Идентично уже принятому для Административной платформы (`docs/admin-platform/IMPLEMENTATION_ORDER.md`, «Итоговое условие»):

```
Этап N считается закрытым только при:
  typecheck ✅ → lint ✅ → tests ✅ → build ✅ → Architecture Guard ✅ (PASS) → commit
```

Этап не начинается, пока предыдущий не закрыт этим условием.

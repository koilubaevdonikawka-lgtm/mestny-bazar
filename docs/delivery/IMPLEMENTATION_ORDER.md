# Порядок реализации — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | План реализации — главный документ разработки модуля |
| **Дата последнего обновления** | 2026-08-02 (Этап 2 закрыт) |
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

## Этап 3 — Продвинутое ценообразование (не начат)

| Поле | Значение |
|---|---|
| **Статус этапа** | Не начат — требует отдельного, явно поставленного промпта, и требует закрытия кандидатов на ADR №1/№2/№3 из `delivery-future-roadmap.md` до начала |
| **Номер** | 3 |
| **Название** | Динамическое ценообразование: расстояние, коэффициенты, корпоративные/праздничные тарифы, ETA |
| **Цель** | Активировать точки расширения, спроектированные, но не реализованные в Этапе 1–2: `BY_DISTANCE`, `DeliveryCoefficient` (погода/нагрузка), реальные корпоративные/праздничные тарифы, полноценный ETA |
| **Предполагаемый объём** | Провайдер геокодирования (после ADR №1); `server/domain/delivery/delivery-coefficient-registry.ts` (после ADR №3); `server/domain/delivery/rules/{corporate-tariff,holiday-tariff,promotional-tariff}.rule.ts` (активация уже спроектированных в Этапе 1 правил реальными данными); события `delivery.tariff.activated`/`.expired` (после решения кандидата №5) |
| **Зависит от** | Этап 2 (полностью), ADR №1, №2 (при активации погодных коэффициентов), №3 |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build, Architecture Guard |

---

## Сводная таблица

| № | Этап | Статус | Ключевая зависимость |
|---|---|---|---|
| 1 | Архитектура и фундамент | ✅ Выполнен | Нет — корень |
| 2 | Реализация ядра | ✅ Выполнен | Этап 1 |
| 3 | Продвинутое ценообразование | Не начат | Этап 2 + ADR №1/№2/№3 |

## Итоговое условие

Идентично уже принятому для Административной платформы (`docs/admin-platform/IMPLEMENTATION_ORDER.md`, «Итоговое условие»):

```
Этап N считается закрытым только при:
  typecheck ✅ → lint ✅ → tests ✅ → build ✅ → Architecture Guard ✅ (PASS) → commit
```

Этап не начинается, пока предыдущий не закрыт этим условием.

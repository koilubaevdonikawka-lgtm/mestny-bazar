# Мастер-спецификация — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Ядро реализовано (Этап 2 из 3), Этап 3 (аудит/полировка) закрыт — проектный документ, Single Source of Truth для модуля |
| **Дата последнего обновления** | 2026-08-02 (Этап 3 — см. таблицу §4 и §5 для актуального статуса реализации) |
| **Связанные документы** | все документы `docs/delivery/`, [`docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md`](../admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md) |
| **Связанные Architecture Principles** | PL-02, PL-05, PL-09, PL-12, CD-01, CD-06 |

---

> Этот документ **не описывает подробно** механику ни одной сущности — для этого существуют `delivery-zones.md`, `delivery-pricing.md`, `delivery-rule-engine.md`, `delivery-events.md`, `delivery-api.md`. Здесь фиксируется только то, что нужно понять **прежде чем** открывать документ конкретной сущности.

## 1. Цель модуля

Delivery Management & Pricing даёт платформе то, чего сегодня нет: **конфигурируемую, географически осознанную, многотарифную систему доставки**, управляемую администратором через интерфейс, а не через правку кода.

Сегодняшнее состояние (см. `server/domain/pricing.service.ts`, `server/adapters/supabase/delivery-zone.repository.ts`): доставка — это плоский список из нескольких зон (`delivery_zones`: `id, name, price, free_from, sort_order`), каждая зона — одна фиксированная цена и один порог бесплатной доставки. Нет городов, нет районов как первоклассной сущности (`AddressDTO.district` — свободный текст, не связан с зоной иначе как вручную), нет расстояния, нет времени доставки, нет более чем одного магазина, нет более чем одной тарифной сетки на зону, нет сезонных/корпоративных тарифов, нет коэффициентов.

Главная цель сформулирована явно, по аналогии с уже принятой для Административной платформы (`ADMIN_PLATFORM_MASTER_SPEC.md`, §1):

> **Любое изменение условий доставки (зона, тариф, коэффициент, минимальная сумма заказа) должно быть возможно без участия разработчика** — через Административную платформу.

## 2. Архитектурная философия

Модуль не вводит новую архитектуру — он **встраивается** в уже существующую Ports & Adapters платформу и наследует её ограничения без исключений (см. [`ARCHITECTURE_BASELINE_V1.md`](../architecture/ARCHITECTURE_BASELINE_V1.md)).

| Принцип | Как проявляется в Delivery Management & Pricing |
|---|---|
| **Server is Source of Truth** | Стоимость и ETA доставки всегда пересчитываются на сервере при каждом запросе (расчёт корзины, оформление заказа) — клиент никогда не присылает готовую стоимость доставки, она всегда результат `DeliveryPricingEngine`, не пользовательский ввод (CD-01, уже применяется точно так же к цене товара в `CartService.validate()`). |
| **Ports & Adapters** | Все сущности (Зона, Тариф, Коэффициент) — репозитории за портами (`server/ports/`), Supabase — единственный адаптер. |
| **Rule Engine** | Выбор применимого тарифа, допустимость доставки в зону, применение коэффициентов — не `if`-цепочки в `CheckoutService`, а зарегистрированные правила Rule Engine (см. `delivery-rule-engine.md`). |
| **Repository Pattern** | Domain не строит SQL-запросы напрямую — только через `IDeliveryZoneRepository` / `IDeliveryTariffRepository` / `IDeliveryCoefficientRepository`. |
| **DTO First** | Frontend (Покупательское PWA и Административная платформа) видит только `shared/contracts/delivery.ts` — не строки БД. |
| **Single Source of Truth для географии и цены** | Ни Покупательское PWA, ни Курьерское PWA (будущее) не хранят собственную копию зон/тарифов — оба читают через один и тот же `DeliveryZoneService`/`DeliveryPricingEngine`. |
| **Extend, Never Replace** | Модуль расширяет уже существующий `IDeliveryZoneRepository`/`PricingService` (см. `delivery-pricing.md`, «Миграция с текущей модели»), не создаёт параллельного механизма расчёта доставки. |

## 3. Общая схема модуля

```
                     ┌───────────────────────────────────┐
                     │         Supabase (единая БД)       │
                     │  cities · stores · delivery_zones ·│
                     │  delivery_districts ·              │
                     │  delivery_tariffs ·                │
                     │  delivery_coefficients             │
                     └──────────────────┬──────────────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     │      server/domain/delivery/         │
                     │  DeliveryZoneService                 │
                     │  DeliveryTariffService                │
                     │  DeliveryPricingEngine (оркестратор) │
                     │  DeliveryZonePolicyService (Rule Eng)│
                     │  DeliveryTariffPolicyService (Rule Eng)│
                     │  DeliveryCoefficientRegistry         │
                     └──────────────────┬──────────────────┘
                                        │ src/api/ (единственный мост)
        ┌──────────────────┬───────────┼───────────┬──────────────────┐
        │                  │           │           │                  │
 ┌──────┴──────┐   ┌───────┴──────┐   │    ┌───────┴───────┐  ┌───────┴───────┐
 │  Покупатель  │   │    Admin     │   │    │  CheckoutService│  │  Курьерское   │
 │  (расчёт     │   │  (управление │   │    │  (уже существует,│  │  PWA (будущее,│
 │  доставки в  │   │  зонами/     │   │    │  потребитель:    │  │  потребитель: │
 │  корзине)    │   │  тарифами)   │   │    │  итоговая fee)    │  │  зона/ETA)    │
 └──────────────┘   └──────────────┘   │    └──────────────────┘  └───────────────┘
                                        │
                              (Marketplace Events →
                               Audit Log, Automation, будущий Courier PWA)
```

## 4. Полный список сущностей

| Сущность | Документ | Статус в кодовой базе (после Этапа 2) |
|---|---|---|
| City (Город) | `delivery-zones.md` | Реализовано, read-only (`ICityRepository`, единственный seeded город «Бишкек»); CRUD/UI управления городами не входили в объём Этапа 2 |
| Store (Магазин/точка отгрузки) | `delivery-zones.md` | Только схема (`stores`) — `storeId` всегда `null` на всех зонах, Repository/Service/UI не созданы |
| Delivery Zone (Зона доставки) | `delivery-zones.md` | Полностью реализовано: `city_id`/`store_id`, `price`/`free_from` перенесены в Тариф; buyer + admin CRUD, admin UI |
| District (Район) | `delivery-zones.md` | Только схема (`delivery_districts`) — не используется приложением; `AddressDTO.district` остаётся свободным текстом, как и было |
| Delivery Tariff (Тариф) | `delivery-pricing.md` | Полностью реализовано: `STANDARD`/`HOLIDAY`/`CORPORATE`/`PROMOTIONAL`, `FIXED`/`BY_ZONE`/`BY_DISTANCE`, несколько тарифов на зону, admin CRUD |
| Delivery Coefficient (Коэффициент) | `delivery-pricing.md` | Не реализовано — Этап 3 |
| Delivery Pricing Engine | `delivery-pricing.md`, `delivery-rule-engine.md` | Реализовано (`DeliveryPricingEngine`) — единственный путь расчёта, `SupabaseDeliveryZoneRepository.calculateFee()` удалён |
| Delivery Calculator | `delivery-pricing.md` | Реализовано (`DeliveryCalculator`, чистая функция, покрыта тестами) |
| Delivery Zone Policy (Rule Engine) | `delivery-rule-engine.md` | Реализовано (`DeliveryZonePolicyService` + 3 правила) |
| Delivery Tariff Policy (Rule Engine) | `delivery-rule-engine.md` | Реализовано (`DeliveryTariffPolicyService` + 4 правила) |
| Delivery Event Model | `delivery-events.md` | Частично: `delivery.zone.*`/`delivery.tariff.created`/`.updated` реализованы; `delivery.tariff.activated`/`.expired` — Этап 3 (открытый вопрос) |

## 5. Роли и доступ

| Действие | Admin | Admin-Marketing | Warehouse | Покупатель |
|---|---|---|---|---|
| Просмотр зон/городов/магазинов | ✅ | ✅ | — | ✅ (только активные, витрина) |
| Создание/редактирование зон, городов, магазинов | ✅ | — | — | — |
| Создание/редактирование тарифов (все типы) | ✅ | ✅ (`AdminMarketingScopeRule`, `permissions.md`) | — | — |
| Создание/редактирование коэффициентов (погода, нагрузка) | ✅ | — | — | — |
| Расчёт стоимости доставки для конкретного адреса | ✅ (через админ-инструменты) | — | — | ✅ (уже сегодня анонимно, `listActiveBanners`-подобный публичный путь) |

Матрица наследует уже принятую модель ролей платформы (`docs/admin-platform/permissions.md`) — новых ролей модуль не вводит.

**Реализовано (Этап 3):** `server/functions/delivery-tariff.executor.ts` вызывает `requireAdminFromRequest()` + `permissionPolicy.assert({ module: "delivery" })` на всех операциях, тем же способом, что `marketing.executor.ts` для купонов — `AdminMarketingScopeRule` расширена модулем `"delivery"`. **Важное уточнение относительно черновика Этапа 1:** проверка — на уровне **модуля** «Доставка» целиком, не на уровне конкретного `tariffType` — Admin-Marketing получает право редактировать тарифы **любого** типа (включая `STANDARD`/`CORPORATE`), не только `HOLIDAY`/`PROMOTIONAL`, как изначально сформулировал черновик. Более тонкая грануляция (по типу тарифа) потребовала бы нового измерения в `PermissionPolicyService`, которого сегодня не существует ни для одного модуля платформы — вводить его специально для Delivery означало бы новую архитектуру, что запрещено этим этапом. Зоны/города/магазины остаются недоступны Admin-Marketing — отдельная, более широкая по влиянию операция, не входящая в её роль.

## 6. Ограничения

1. **Модуль не владеет заказом.** `OrderDTO.deliveryFee` остаётся полем заказа, вычисленным и зафиксированным в момент оформления (снимок, как и цена товара — CD-06). Delivery Management & Pricing вычисляет стоимость по запросу, не хранит и не изменяет уже размещённые заказы.
2. **Модуль не владеет курьером.** Назначение курьера, статус доставки конкретного заказа — домен `couriers.md`. Delivery Management & Pricing предоставляет зону и ETA как данные, не управляет курьером.
3. **Расчёт по расстоянию требует внешнего провайдера геокодирования/маршрутизации**, которого сегодня в проекте нет — это явно вынесено в `delivery-future-roadmap.md` как решение, требующее ADR **до** реализации, не подразумевается автоматически доступным.
4. **Никакой параллельной ценовой модели.** `PricingService.calculateTotal()` (уже существует, применяет скидку) не переизобретается — `DeliveryPricingEngine` дополняет его результатом `fee`, финальная арифметика (`subtotal + fee − discount`) остаётся в одном месте.
5. **`customerSegment: "CORPORATE"` сегодня недостижим из реального запроса.** `CorporateTariffRule` реализован, зарегистрирован в цепочке и покрыт тестами (`delivery-tariff-policy.service.test.ts`) — но ни `CheckoutService`, ни `PricingService.calculateDeliveryFee()`, ни buyer-facing `calculateDeliveryFeeFn` нигде не передают `customerSegment` (контекст всегда `undefined`). Это не мёртвый код — правило вызывается на каждом расчёте, просто ни разу не совпадает — а честно задокументированное ограничение: определение «кто является корпоративным клиентом» — отдельное продуктовое решение (новый признак пользователя/адреса), не входящее в объём Delivery Management & Pricing. Администратор уже сегодня может создать `CORPORATE`-тариф через `/admin/delivery` — он просто не будет выбран ни для одного реального заказа, пока источник `customerSegment` не появится.

## Ссылки

- [`ARCHITECTURE_BASELINE_V1.md`](../architecture/ARCHITECTURE_BASELINE_V1.md)
- [`docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md`](../admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md)
- [`docs/admin-platform/orders.md`](../admin-platform/orders.md)

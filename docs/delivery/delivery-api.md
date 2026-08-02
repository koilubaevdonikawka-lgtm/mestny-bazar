# Контур API — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Черновая архитектура — не реализовано (план транспортного слоя, не код) |
| **Дата последнего обновления** | 2026-08-02 |
| **Связанные документы** | [`delivery-zones.md`](./delivery-zones.md), [`delivery-pricing.md`](./delivery-pricing.md), [`delivery-rule-engine.md`](./delivery-rule-engine.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md) |
| **Связанные Architecture Principles** | PL-01 (Platform Layer), CD-01 (Never Trust Client Data), PL-13 (Engineering Roles) |

---

**Модуль:** Delivery Management & Pricing — API
**Статус в коде:** не существует
**Роли с доступом:** см. таблицу ниже

> Этот документ фиксирует **план** транспортного слоя — какие server functions появятся, с каким контрактом и под какой ролью — не создаёт ни одного файла. Реализация — Этап 2 (`IMPLEMENTATION_ORDER.md`).

## Слой транспорта (уже принятый паттерн, не новый)

Тот же 3-слойный паттерн, что уже используют все модули платформы: `server/functions/*.executor.ts` (или `*.functions.ts` для read-путей без побочных эффектов, см. прецедент `catalog.functions.ts`) → `src/api/*.functions.ts` (`createServerFn`-граница) → `src/api/*.ts` (единственный мост для фронтенда). Delivery Management & Pricing не вводит альтернативного способа связи фронтенда с сервером.

## Публичные (buyer-facing) функции

| Функция | Метод | Роль | Назначение |
|---|---|---|---|
| `listCitiesFn` | GET | Любой (в т.ч. анонимный) | Список активных городов — для переключателя города на витрине |
| `listDeliveryZonesFn` | GET | Любой | Список активных зон текущего города — расширяет уже существующий путь получения зон (сегодня используется при выборе адреса), не заменяет его резко |
| `calculateDeliveryFeeFn` | GET/POST | Любой (гость и авторизованный — как уже сегодня для расчёта в корзине) | Принимает `{ addressId | zoneId, subtotal }`, возвращает `DeliveryFeeQuote`. **Заменяет** сегодняшний путь через `SupabaseDeliveryZoneRepository.calculateFee()`, вызываемый `PricingService.calculateDeliveryFee()` — тот же порт `IDeliveryZoneRepository`-уровня вызов, но теперь маршрутизированный через `DeliveryPricingEngine` (Rule Engine), а не хардкод-метод |

Цена никогда не принимается от клиента (CD-01) — `calculateDeliveryFeeFn` **пересчитывает** на основе `addressId`/`zoneId` и текущего состояния тарифов/коэффициентов на сервере, ровно как уже сегодня `CartService.validate()` не доверяет присланной клиентом цене товара.

## Административные (admin-facing) функции

| Функция | Метод | Роль | Назначение |
|---|---|---|---|
| `listAdminCitiesFn` / `createCityFn` / `updateCityFn` | GET / POST / POST | Admin | CRUD городов |
| `listAdminStoresFn` / `createStoreFn` / `updateStoreFn` | GET / POST / POST | Admin | CRUD магазинов |
| `listAdminDeliveryZonesFn` / `createDeliveryZoneFn` / `updateDeliveryZoneFn` | GET / POST / POST | Admin | CRUD зон (без цены — цена в тарифе) |
| `listAdminDistrictsFn` / `createDistrictFn` / `updateDistrictFn` | GET / POST / POST | Admin | CRUD районов |
| `listDeliveryTariffsFn` / `createDeliveryTariffFn` / `updateDeliveryTariffFn` | GET / POST / POST | Admin (стандартные тарифы), Admin-Marketing (сезонные/акционные — переиспользует `AdminMarketingScopeRule`, `permissions.md`) | CRUD тарифов |
| `listDeliveryCoefficientsFn` / `createDeliveryCoefficientFn` / `updateDeliveryCoefficientFn` | GET / POST / POST | Admin | CRUD коэффициентов |

Каждая admin-функция проходит `requireAdminFromRequest()` (или `requireAdminScopeFromRequest("marketing")` для отмеченных выше), затем при необходимости — `assert()` соответствующего Rule Engine, тем же способом, что уже применяется во всех существующих `*.executor.ts` (см. `docs/principles/13-engineering-roles.md`, «Какой адаптер каталога?» — таблица прецедентов «куда смотреть за ответом на вопрос»).

## Контракты (`shared/contracts/delivery.ts`, план расширения)

Существующие `DeliveryZoneDTO`/`AddressDTO`/`DeliveryFeeQuote` расширяются аддитивно (новые опциональные поля, ничего не удаляется из уже используемых мест до миграции Этапа 2), плюс новые: `CityDTO`, `StoreDTO`, `DistrictDTO`, `DeliveryTariffDTO`, `DeliveryCoefficientDTO`. Точные поля — уже специфицированы в `delivery-zones.md` и `delivery-pricing.md`, здесь не дублируются.

## Валидация (`shared/validation/`, план)

По уже принятому паттерну (Zod-схемы, `shared/validation/*.schema.ts`, один файл на контракт) — `city.schema.ts`, `store.schema.ts`, `delivery-zone.schema.ts`, `delivery-tariff.schema.ts`, `delivery-coefficient.schema.ts`. Ни один не создаётся в этом этапе.

## Инварианты

- ❌ Прямой вызов `server/domain/delivery/*` из `src/routes/*` в обход `src/api/*`.
- ❌ Admin-функция без `requireAdminFromRequest()`/`requireAdminScopeFromRequest()`.
- ❌ Приём готовой стоимости доставки от клиента без пересчёта на сервере.
- ❌ Второй путь получения зон/тарифов в обход перечисленных выше функций (например, прямой Supabase-запрос из фронтенда).

## Ссылки

- [`docs/principles/01-platform-layer.md`](../principles/01-platform-layer.md)
- [`docs/admin-platform/permissions.md`](../admin-platform/permissions.md) — модель ролей, переиспользуемая без изменений

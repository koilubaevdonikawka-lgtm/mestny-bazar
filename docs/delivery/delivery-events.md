# Delivery Event Model

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Черновая архитектура — не реализовано |
| **Дата последнего обновления** | 2026-08-02 |
| **Связанные документы** | [`delivery-zones.md`](./delivery-zones.md), [`delivery-pricing.md`](./delivery-pricing.md), [`docs/admin-platform/automation.md`](../admin-platform/automation.md), [`docs/admin-platform/logs.md`](../admin-platform/logs.md) |
| **Связанные ADR** | нет |
| **Связанные Architecture Principles** | PL-12 неявно (события — побочный эффект решений Rule Engine, не сами решения) |

---

**Модуль:** Delivery Management & Pricing — События
**Статус в коде:** не существует — `MarketplaceEvent` (`server/ports/marketplace-events.port.ts`) не содержит вариантов `delivery.*`
**Роли с доступом:** н/п

> Этот документ проектирует, какие значимые изменения модуля публикуются как `MarketplaceEvent`, по тому же принципу, что уже применяется ко всем существующим модулям: событие публикуется на изменение **состояния**, доступного другим частям системы (Audit Log, Automation Overview, будущий Courier PWA), не на каждый внутренний вызов метода.

## Принцип отбора событий

Публикуется только то, что удовлетворяет хотя бы одному критерию (тот же критерий, что уже неявно применён к существующим `category.*`/`coupon.*`/`banner`-событиям):

1. Меняет то, что видит покупатель или курьер (доступность зоны, действующая цена).
2. Меняет то, что администратор должен увидеть в Журнале событий (`logs.md`) без чтения БД напрямую.
3. Является триггером для другого, уже существующего или будущего модуля (Automation Overview, Courier PWA).

Синхронный расчёт стоимости доставки (`calculateDeliveryFee`) **не публикует событие** — это read-путь, как и сегодняшний `PricingService.calculateDeliveryFee()`, не изменяет состояния. Публикация события на каждый расчёт корзины создала бы событийный шум без потребителя (по аналогии с тем, что `CatalogService.getProductBySlug()` тоже не публикует событий).

## Спроектированные события

Расширение `MarketplaceEvent` (`server/ports/marketplace-events.port.ts`) — аддитивное, новые варианты добавляются в существующий discriminated union, не создают второй шины:

```typescript
| { type: "delivery.zone.created"; zone: DeliveryZoneDTO }
| { type: "delivery.zone.updated"; zone: DeliveryZoneDTO }
| { type: "delivery.zone.deactivated"; zoneId: string }
| { type: "delivery.tariff.created"; tariff: DeliveryTariffDTO }
| { type: "delivery.tariff.updated"; tariff: DeliveryTariffDTO }
| { type: "delivery.tariff.activated"; tariff: DeliveryTariffDTO }
| { type: "delivery.tariff.expired"; tariffId: string }
| { type: "delivery.coefficient.activated"; coefficient: DeliveryCoefficientDTO }
| { type: "delivery.coefficient.deactivated"; coefficientId: string }
```

| Событие | Публикуется из | Кто уже подписан по умолчанию | Кто подпишется новым |
|---|---|---|---|
| `delivery.zone.created` / `.updated` / `.deactivated` | `DeliveryZoneService` (admin CRUD) | Audit Log (`subscribeAuditLog`, как и все остальные события — см. `server/domain/audit-log/marketplace-events.subscriber.ts`) | Automation Overview (каталог автоматизации, `automation.md`) — регистрация как наблюдаемое событие, без новой логики |
| `delivery.tariff.created` / `.updated` | `DeliveryTariffService` (admin CRUD) | Audit Log | — |
| `delivery.tariff.activated` | `DeliveryTariffPolicyService` в момент, когда правило (`HolidayTariffRule`/`PromotionalTariffRule`) впервые находит тариф активным в текущем окне — не на каждый расчёт, а на переход состояния (см. «Открытый вопрос» ниже) | Audit Log | Будущий Courier PWA — знать, что действует особый (праздничный) тариф, может влиять на ожидаемую загрузку |
| `delivery.tariff.expired` | Идемпотентный lazy sweep (по аналогии с уже существующим `order-lifecycle-cascade.service.ts` — на платформе нет cron/scheduler, см. `platform-lifecycle.md`, §3) при чтении тарифов после `validTo` | Audit Log | — |
| `delivery.coefficient.activated` / `.deactivated` | `DeliveryCoefficientService` (admin CRUD/ручное включение) | Audit Log | Automation Overview |

## Открытый вопрос (честно зафиксирован, не решён здесь)

`delivery.tariff.activated` описан выше как «переход состояния», но при чисто демонстративном (`Rule Engine` пересчитывает на каждый запрос, не хранит состояние «сейчас активен») подходе такого перехода как отдельного события технически не существует — есть только «правило совпало на этом конкретном расчёте». Публикация события на каждое совпадение правила при высокой частоте запросов расчёта доставки создала бы событийный шум, которого не создают `stock.adjusted`/`settings.changed` (низкочастотные, административные действия).

Решение этого вопроса (например: публиковать только при первом совпадении за календарные сутки; либо вообще не публиковать это конкретное событие в Этапе 2, отложив до появления реального потребителя — Courier PWA) — явно не принимается в этом документе. Зафиксировано в `delivery-future-roadmap.md` как открытый пункт, требующий решения до реализации Этапа 3, не Этапа 2 (Этап 2 может обойтись без `delivery.tariff.activated`/`delivery.tariff.expired` вовсе — оба события отмечены как принадлежащие Этапу 3 в `IMPLEMENTATION_ORDER.md`).

## Подписчики (расширение уже существующих, не новые механизмы)

- **Audit Log** (`server/domain/audit-log/marketplace-events.subscriber.ts`) — подписывается на все `delivery.*` события по тому же принципу, что уже подписан на все существующие типы (единая точка регистрации, не выборочная).
- **Automation Overview** (`server/domain/automation-overview.service.ts`) — статический, вручную поддерживаемый каталог (уже так спроектирован для остальной платформы, `automation.md`) — добавляется запись про Delivery Management & Pricing при переходе к реализации, не в этом документе.
- **Courier PWA** (будущее) — не проектируется в этом документе (вне архитектурного этапа Delivery Management & Pricing), но события `delivery.tariff.activated`/`delivery.coefficient.activated` спроектированы с расчётом на то, что именно Courier PWA станет их первым реальным потребителем, поэтому они не удаляются просто потому, что сегодня нет подписчика — прецедент этому уже есть в проекте: `courier.status_changed` было добавлено в `MarketplaceEvent` до полноценного Courier PWA.

## Инварианты

- ❌ Публикация события из транспортного слоя (`server/functions/delivery.executor.ts`) вместо Domain — события всегда публикует `server/domain/delivery/*.service.ts`, как и для всех существующих модулей.
- ❌ Второй `IMarketplaceEventBus` или отдельная шина для Delivery — используется тот же `server/ports/marketplace-events.port.ts`.
- ❌ Синхронная бизнес-логика внутри подписчика, блокирующая публикацию события (Marketplace Events — синхронная in-process шина в этом проекте, но подписчик не должен становиться местом принятия решений, которые принадлежат Rule Engine).

## Ссылки

- [`server/ports/marketplace-events.port.ts`](../../server/ports/marketplace-events.port.ts) — существующий discriminated union, расширяемый этим документом
- [`delivery-future-roadmap.md`](./delivery-future-roadmap.md)

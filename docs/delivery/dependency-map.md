# Карта зависимостей — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Черновая архитектура — не реализовано |
| **Дата последнего обновления** | 2026-08-02 |
| **Связанные документы** | все документы `docs/delivery/`, [`docs/admin-platform/dependency-map.md`](../admin-platform/dependency-map.md) |
| **Связанные ADR** | нет |
| **Связанные Architecture Principles** | PL-02 (Ports & Adapters), POL-04 (Module Independence) |

---

> Этот документ описывает зависимости **между Delivery Management & Pricing и остальной платформой** — по тому же принципу, что уже принят в `docs/admin-platform/dependency-map.md`: логическая/функциональная зависимость, не порядок реализации (для порядка — `IMPLEMENTATION_ORDER.md`).

## Полная карта

| Модуль | Влияет на Delivery (Delivery зависит от) | Delivery использует (потребляет) | Нельзя менять независимо от |
|---|---|---|---|
| **Заказы (`orders.md`)** | Форма `OrderDTO.deliveryFee`/адрес доставки уже существуют — Delivery не может спроектировать `DeliveryFeeQuote` иначе, чем совместимо с уже принятым контрактом заказа | — | Заказы (`CheckoutService` — единственный потребитель итоговой `fee` при оформлении, снимок фиксируется в заказе — CD-06, как и цена товара) |
| **Склад (`warehouse.md`)** | Модель "Store" (точка отгрузки) спроектирована как независимая от текущей плоской модели остатков — явно зафиксировано в `delivery-zones.md`, чтобы не блокироваться на будущей эволюции `warehouse.md` | — (пока) | — (сегодня независимы; станут зависимы, если/когда `warehouse.md` введёт per-location остатки — тогда потребуется пересмотр обоих документов одновременно) |
| **Настройки (`settings.md`)** | Модель ролей и паттерн бизнес-настроек через БД (а не `process.env`) — Delivery Tariff/Coefficient CRUD следует тому же паттерну, что `settings.md` уже проектирует для остальной платформы | — | — (Delivery — потребитель уже принятого паттерна, не источник для Settings) |
| **Маркетинг (`marketing.md`)** | Модель ролей `Admin-Marketing` (`AdminMarketingScopeRule`) — переиспользуется без изменений для управления `PROMOTIONAL`/`HOLIDAY`-тарифами | — | Маркетинг (если `marketing.md` введёт собственные акции, затрагивающие доставку — например, «бесплатная доставка по промокоду» — потребуется согласовать с `DeliveryTariffPolicyService`, не дублировать логику в `DiscountPolicyService`) |
| **Права доступа (`permissions.md`)** | Матрица ролей (Admin/Admin-Marketing) — используется без изменений, Delivery не вводит новых ролей | — | — |
| **Курьеры (`couriers.md`)** | — | — (сегодня) | Курьеры (будущее Курьерское PWA — первый реальный потребитель `zoneId`/`eta`/`delivery.tariff.activated`, см. `delivery-events.md`) — контракт этих полей не может измениться независимо, когда Courier PWA перейдёт от планирования к реализации |
| **Автоматизация (`automation.md`)** | (наблюдает за событиями Delivery) | Delivery события (`delivery.zone.*`, `delivery.tariff.*`, `delivery.coefficient.*`) | — (чисто наблюдающий модуль, как и для остальной платформы) |
| **Журналы (`logs.md`)** | (наблюдает за событиями Delivery) | Delivery события (через уже существующую единую подписку Audit Log) | — |
| **Финансы (`finance.md`)** | — | Потенциально: `order.deliveryFee` как есть (уже существующее поле, не новая зависимость от Delivery) | — |

## Ключевая зависимость (сводка)

1. **Delivery ↔ Заказы** — самая жёсткая связь: `DeliveryPricingEngine.calculate()` вызывается из `CheckoutService` (замена сегодняшнего `PricingService.calculateDeliveryFee()`), результат становится частью `OrderDTO` в момент создания заказа. Изменение контракта `DeliveryFeeQuote` требует одновременного пересмотра `CheckoutService`/`orders.md` — тот же класс риска, что уже описан в `docs/admin-platform/dependency-map.md` для пары «Заказы ↔ Склад».
2. **Delivery ↔ Курьеры** — сегодня односторонняя (Delivery ничего не требует от Courier PWA), станет двусторонней при реализации Courier PWA: зона/ETA, спроектированные здесь, — часть будущего контракта курьерского приложения, поэтому их форма фиксируется уже сейчас, не оставляется полностью открытой.
3. **Delivery ↔ Маркетинг** — общая ответственность за «скидку»/«бесплатную доставку»: `DiscountPolicyService` (купоны, скидка на товары) и `DeliveryTariffPolicyService`/`DeliveryCoefficientRegistry` (тарифы доставки) — два разных механизма, применяемых к двум разным компонентам итоговой суммы (`subtotal` vs. `deliveryFee`), не должны дублировать друг друга при появлении маркетинговых акций, затрагивающих доставку.

## Инварианты, специфичные для этой карты

- ❌ `DeliveryTariffPolicyService` не читает `DiscountPolicyContext` напрямую и наоборот — общий контекст (если понадобится) передаётся через оркестратор (`CheckoutService`/`DeliveryPricingEngine`), не через прямую связь между двумя Policy-сервисами (см. `ARCHITECTURE_BASELINE_V1.md`, §4 — «дублирование бизнес-логики»/«обход Domain»).
- ❌ Courier PWA (при реализации) не получает зону/тариф напрямую из Supabase — только через уже спроектированные в `delivery-api.md` функции, как и Покупательское PWA.

## Ссылки

- [`docs/admin-platform/dependency-map.md`](../admin-platform/dependency-map.md) — карта для остальной платформы, тот же формат
- [`IMPLEMENTATION_ORDER.md`](./IMPLEMENTATION_ORDER.md)

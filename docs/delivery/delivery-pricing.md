# Ценообразование доставки — Delivery Tariff / Pricing Engine / Calculator

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Черновая архитектура — не реализовано |
| **Дата последнего обновления** | 2026-08-02 (Этап 2 — порядок шагов Pricing Engine исправлен по факту реализации) |
| **Связанные документы** | [`delivery-zones.md`](./delivery-zones.md), [`delivery-rule-engine.md`](./delivery-rule-engine.md), [`docs/admin-platform/orders.md`](../admin-platform/orders.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md); распознавание адреса по расстоянию требует нового ADR — см. [`delivery-future-roadmap.md`](./delivery-future-roadmap.md) |
| **Связанные Architecture Principles** | PL-12 (Rule Engine), CD-01 (Never Trust Client Data), CD-06 (DB-row-to-DTO mapping) |

---

**Модуль:** Delivery Management & Pricing — Тарифы и расчёт
**Статус в коде:** частично существует — `PricingService.calculateDeliveryFee()` делегирует в `SupabaseDeliveryZoneRepository.calculateFee()`, единственная модель: `fee = subtotal >= freeFrom ? 0 : price`
**Роли с доступом:** Admin (полный CRUD тарифов), Admin-Marketing (сезонные/акционные тарифы), Покупатель (только результат расчёта, не сами тарифы)

> Этот документ описывает **что** такое тариф и **как** из набора применимых тарифов и коэффициентов получается финальная стоимость доставки. **Кто выбирает** применимый тариф — Rule Engine, описанный в `delivery-rule-engine.md`.

## Назначение

Заменить сегодняшнюю модель «одна зона = одна цена» на модель «одна зона может иметь несколько тарифов (стандартный, сезонный, корпоративный), и Rule Engine на каждый расчёт решает, какой применим и какие коэффициенты добавляются сверху» — без изменения кода на каждое новое тарифное решение.

## Delivery Tariff (Тариф)

Тариф — самостоятельная сущность, не подчинённая полю Зоны. Одна Зона может иметь несколько Тарифов одновременно (активных в разное время / для разных сегментов покупателей); Rule Engine (`delivery-rule-engine.md`) выбирает ровно один применимый Тариф на конкретный расчёт.

| Поле | Тип | Назначение |
|---|---|---|
| `id` | UUID | |
| `zoneId` | UUID → Delivery Zone, nullable | `null` = тариф по умолчанию для города/платформы, если для зоны не задан собственный |
| `name` | text | «Стандартный», «Новогодний», «Корпоративный B2B» |
| `tariffType` | enum: `STANDARD` \| `HOLIDAY` \| `CORPORATE` \| `PROMOTIONAL` | Определяет, какое правило Rule Engine его выбирает (`delivery-rule-engine.md`) |
| `pricingModel` | enum: `FIXED` \| `BY_ZONE` \| `BY_DISTANCE` | Как считается база стоимости (ниже) |
| `basePrice` | decimal | База для `FIXED`/`BY_ZONE` |
| `pricePerKm` | decimal, nullable | Только для `BY_DISTANCE` |
| `minOrderForFreeDelivery` | decimal, nullable | Порог бесплатной доставки (как сегодняшний `free_from`) |
| `minOrderAmount` | decimal, nullable | Минимальная сумма заказа, при которой доставка в эту зону вообще доступна (новое — сегодня отсутствует) |
| `validFrom` / `validTo` | timestamp, nullable | Окно действия — обязательно для `HOLIDAY`/`PROMOTIONAL`, `null`/`null` = бессрочно (обычно `STANDARD`) |
| `priority` | int | Явный порядок для Rule Engine (не magic number внутри сервиса — см. `delivery-rule-engine.md`) |
| `isActive` | boolean | Ручное включение/выключение администратором, независимо от `validFrom`/`validTo` |

### Модели расчёта базовой стоимости (`pricingModel`)

| Модель | Формула | Готовность |
|---|---|---|
| `FIXED` | `fee = basePrice` | Полностью специфицирована, соответствует сегодняшнему поведению 1:1 |
| `BY_ZONE` | `fee = basePrice` (то же, что `FIXED`, но подразумевает разные `basePrice` на разные зоны одного тарифа — разница чисто смысловая, не техническая) | Полностью специфицирована |
| `BY_DISTANCE` | `fee = basePrice + pricePerKm × distanceKm` | Специфицирована на уровне формулы; `distanceKm` требует внешнего провайдера геокодирования/маршрутизации, которого сегодня нет — модель проектируется, но не активируется до решения по провайдеру (см. `delivery-future-roadmap.md`) |

## Delivery Coefficient (Коэффициент)

Множитель, применяемый **поверх** уже выбранного Тарифа. В отличие от Тарифа (который выбирается — ровно один), коэффициенты **накапливаются** — их может быть применено несколько одновременно (например, погодный + нагрузочный).

| Поле | Тип | Назначение |
|---|---|---|
| `id` | UUID | |
| `type` | enum: `WEATHER` \| `LOAD` \| `HOLIDAY` \| `CUSTOM` | |
| `multiplier` | decimal | Например, `1.3` = +30% |
| `condition` | jsonb | Условие применения в машиночитаемом виде (например, `{ "minTempC": -10 }` для `WEATHER`) — читается только правилом-адаптером конкретного типа, не интерпретируется универсальным движком (см. «Почему коэффициенты — не тот же Rule Engine» ниже) |
| `validFrom` / `validTo` | timestamp, nullable | |
| `isActive` | boolean | |

## Delivery Pricing Engine (оркестратор)

`DeliveryPricingEngine` — доменный сервис-оркестратор (не Rule Engine сам по себе), аналогичный по роли `CheckoutService`: не содержит бизнес-правил, а **последовательно вызывает** уже существующие Rule Engine и Calculator, в фиксированном порядке:

```
1. IDeliveryZoneRepository.getById(zoneId)
      → Zone (или отказ: DeliveryZoneNotFoundError)
2. DeliveryTariffPolicyService.evaluate(context)       — Rule Engine (delivery-rule-engine.md)
      → какой Tariff применяется (Corporate → Holiday → Promotional → Standard, см. приоритет)
3. DeliveryZonePolicyService.assert(context)          — Rule Engine (delivery-rule-engine.md)
      → допустима ли доставка вообще, используя minOrderAmount УЖЕ ВЫБРАННОГО тарифа
4. DeliveryCoefficientRegistry.collectApplicable(context)   — Этап 3, не реализовано в Этапе 2
      → список применимых Coefficient (не Rule Engine — см. ниже)
5. DeliveryCalculator.calculate(tariff, coefficients, context)
      → DeliveryFeeQuote (итоговая fee + breakdown + ETA)
```

**Исправление относительно Этапа 1:** первоначальный черновик располагал Zone Policy перед Tariff Policy. При реализации (Этап 2) обнаружено, что `MinOrderAmountRule` физически не может работать до выбора тарифа — `minOrderAmount` принадлежит `DeliveryTariffDTO`, не Zone. Порядок исправлен на «сначала тариф, затем допустимость» — тот же класс находки-и-исправления при реализации, что уже был у Этапа 5 Административной платформы (`payout.created`/`payout.completed`). См. `server/domain/delivery-pricing-engine.service.ts`, doc-комментарий класса.

Это то же самое разделение «оркестратор не содержит правил, правила — в зарегистрированных сервисах», что уже применяется в `CheckoutService` (композирует `PaymentPolicyService`, `OrderLifecyclePolicy`, `DiscountPolicyService` — не содержит их логики внутри себя).

## Delivery Calculator

Чистая, не обращающаяся к БД функция (аналог уже существующего `PricingService.calculateSubtotal`/`calculateTotal`) — принимает уже разрешённые Tariff + список Coefficient + контекст (subtotal, distanceKm) и возвращает `DeliveryFeeQuote`:

```
DeliveryFeeQuote {
  zoneId, tariffId
  subtotal
  baseFee            — результат pricingModel тарифа, до коэффициентов
  coefficientsApplied: Array<{ id, type, multiplier }>
  fee                — baseFee × произведение всех multiplier, округлённое по правилу платформы
  isFree             — subtotal >= tariff.minOrderForFreeDelivery
  eta: { minMinutes, maxMinutes }
}
```

Округление, минимально допустимая fee (не может уйти в отрицательное значение), и точная семантика композиции нескольких коэффициентов (умножение, а не сложение процентов — во избежание неоднозначности «30% + 20% = 50% или 56%») — фиксируются как часть контракта Calculator в Этапе 2 (не в этом документе — это единственная деталь, оставленная открытой намеренно, поскольку зависит от продуктового решения о конкретных значениях, а не от архитектуры).

## Почему коэффициенты — не тот же Rule Engine, что выбор тарифа

Это осознанное архитектурное решение, а не пропуск. Стандартный Rule Engine (Принцип 12) — это **guard-цепочка с одним результатом**: движок останавливается на первом подходящем терминальном правиле и возвращает **его** результат (`DiscountPolicyService.evaluate()` — ровно так). Выбор тарифа (шаг 3 выше) точно соответствует этой семантике: «первое подходящее правило по приоритету — Corporate, затем Holiday, затем Standard-fallback — побеждает».

Коэффициенты (шаг 4) решают другую задачу: **не «какое одно правило победило», а «сколько независимых правил применимо одновременно, и что каждое из них добавляет»**. Стандартный движок для этого не спроектирован — накопление результатов нескольких нетерминальных правил не входит в алгоритм Принципа 12 (нетерминальное правило лишь не останавливает цепочку, его собственный результат нигде не накапливается движком).

Поэтому `DeliveryCoefficientRegistry` спроектирован как отдельный, более простой механизм: список `{ applies(context): boolean; getMultiplier(context): number }`, каждый элемент независим, движок просто фильтрует применимые и передаёт список в Calculator. Он **не претендует** быть Rule Engine в смысле Принципа 12 — это зафиксировано явно, чтобы не создавать ложного впечатления полного соответствия там, где задача архитектурно другая. Это же — прямая причина, по которой `DeliveryCoefficientRegistry` зафиксирован как кандидат на отдельный ADR перед реализацией в Этапе 3 (см. `delivery-future-roadmap.md`) — это новый, ранее не существовавший в проекте класс механизма, а не переиспользование Принципа 12.

## Миграция с текущей модели (план для Этапа 2, не выполняется здесь)

`delivery_zones.price`/`delivery_zones.free_from` → по одной записи `Delivery Tariff` (`tariffType: STANDARD`, `pricingModel: FIXED`, `basePrice = price`, `minOrderForFreeDelivery = free_from`) на каждую существующую зону. Аддитивная миграция, без потери данных, без изменения наблюдаемого поведения до момента, пока не будет создан второй тариф на ту же зону.

## Ссылки

- [`delivery-zones.md`](./delivery-zones.md)
- [`delivery-rule-engine.md`](./delivery-rule-engine.md)
- [`delivery-future-roadmap.md`](./delivery-future-roadmap.md)

# Delivery Management & Pricing — документация

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Частично реализовано (Этап 2 из 3: ядро закрыто — зоны, тарифы, Rule Engine, Checkout/PWA-интеграция; расстояние/коэффициенты — Этап 3) |
| **Дата последнего обновления** | 2026-08-02 (Этап 2 закрыт) |
| **Связанные документы** | все документы `docs/delivery/`, [`docs/admin-platform/orders.md`](../admin-platform/orders.md), [`docs/admin-platform/warehouse.md`](../admin-platform/warehouse.md) |
| **Связанные ADR** | [ADR-001](../adr/ADR-001-ports-and-adapters.md); см. [`delivery-future-roadmap.md`](./delivery-future-roadmap.md) для кандидатов на новый ADR |
| **Связанные Architecture Principles** | PL-02 (Ports & Adapters), PL-05 (Composition Root), PL-12 (Rule Engine), CD-01 (Never Trust Client Data) |

---

Этот файл — точка входа во всю документацию модуля **Delivery Management & Pricing**. Если вы впервые открываете `docs/delivery/` — начните отсюда.

## Назначение модуля

Delivery Management & Pricing — модуль, отвечающий за **всё, что определяет стоимость и условия доставки заказа**: географическое покрытие (города, зоны, районы), тарифные сетки, коэффициенты, срок доставки (ETA). Модуль заменяет сегодняшний плоский, захардкоженный расчёт (`SupabaseDeliveryZoneRepository.calculateFee`) полноценным, конфигурируемым через Административную платформу механизмом — без единой правки кода на каждое новое правило ценообразования.

Это прямое продолжение уже принятого в проекте курса: **Server + Database — единственный источник истины** ([`ARCHITECTURE_BASELINE_V1.md`](../architecture/ARCHITECTURE_BASELINE_V1.md), §6), и **бизнес-логика конфигурируется, а не хардкодится** (Rule Engine, Принцип 12).

## Что реализовано (Этапы 1–2 из 3)

Этап 1 зафиксировал архитектуру (доменная модель, Rule Engine, модель событий, контур API, карта зависимостей). Этап 2 реализовал её полностью: миграции, DTO, Repository, два Rule Engine, `DeliveryPricingEngine`, CRUD API, раздел `/admin/delivery`, интеграция с `CheckoutService` (единственный путь расчёта — старый `IDeliveryZoneRepository.calculateFee()` удалён) и с Покупательским PWA (выбор зоны, отображение стоимости/ETA/бесплатной доставки).

Продвинутое ценообразование (расстояние, коэффициенты, реальные корпоративные/праздничные кампании) — Этап 3, начинается только после отдельного промпта и закрытия ADR-кандидатов — см. [`IMPLEMENTATION_ORDER.md`](./IMPLEMENTATION_ORDER.md), [`delivery-future-roadmap.md`](./delivery-future-roadmap.md).

## Структура документации

```
docs/delivery/
├── README.md                    ← вы здесь
├── DELIVERY_MASTER_SPEC.md      ← центральный документ (не детализирует механику)
├── delivery-zones.md            ← City / Store / Delivery Zone / District
├── delivery-pricing.md          ← Delivery Tariff / Pricing Engine / Calculator
├── delivery-rule-engine.md      ← Delivery Rule / Delivery Policy (Rule Engine)
├── delivery-events.md           ← Delivery Event Model (Marketplace Events)
├── delivery-api.md              ← контур API (план, без кода)
├── delivery-future-roadmap.md   ← динамическое ценообразование, коэффициенты, кандидаты на ADR
├── IMPLEMENTATION_ORDER.md      ← порядок реализации, 3 этапа
└── dependency-map.md            ← зависимости от других модулей платформы
```

## Порядок чтения документов

1. **Этот README** — что где лежит и зачем.
2. [`DELIVERY_MASTER_SPEC.md`](./DELIVERY_MASTER_SPEC.md) — цель, философия, общая схема, полный список сущностей, роли и доступ. Не детализирует ни один механизм — это намеренно.
3. [`delivery-zones.md`](./delivery-zones.md) → [`delivery-pricing.md`](./delivery-pricing.md) → [`delivery-rule-engine.md`](./delivery-rule-engine.md) — доменная модель от географии к цене к механизму принятия решения, в этом порядке (каждый следующий документ опирается на предыдущий).
4. [`delivery-events.md`](./delivery-events.md) — как модуль сообщает об изменениях остальной платформе.
5. [`delivery-api.md`](./delivery-api.md) — контур транспортного слоя (план, не реализация).
6. [`delivery-future-roadmap.md`](./delivery-future-roadmap.md) — что спроектировано, но сознательно отложено, и что из этого требует ADR до начала реализации.
7. [`dependency-map.md`](./dependency-map.md) — зависимости от остальной платформы.
8. [`IMPLEMENTATION_ORDER.md`](./IMPLEMENTATION_ORDER.md) — открывается непосредственно перед началом Этапа 2, не раньше.

## Связь с Architecture Baseline

Delivery Management & Pricing **не вводит новую архитектуру** — он встраивается в уже зафиксированный [`ARCHITECTURE_BASELINE_V1.md`](../architecture/ARCHITECTURE_BASELINE_V1.md) и наследует его инварианты без исключений: единственный источник каталога/данных не затрагивается (модуль не создаёт альтернативного пути к данным о товаре или заказе), Domain обращается к Supabase только через порты, любое «можно/нельзя»-решение — через Rule Engine, любой новый сервис регистрируется только в `server/di/container.ts`.

Модуль **не добавляет** новый top-level компонент в схему платформы (`ARCHITECTURE_BASELINE_V1.md`, §2) — в отличие от Курьерского PWA (новая точка входа), Delivery Management & Pricing — это новая группа Domain-сервисов и Rule Engine, доступная через уже существующие точки входа (Административная платформа и Покупательское PWA / Checkout). Обоснование, почему `ARCHITECTURE_BASELINE_V1.md` не требует правки для этого модуля — см. финальный отчёт Промпта №020.

## Связь с ADR

Сегодня существует два ADR — [ADR-001](../adr/ADR-001-ports-and-adapters.md) и [ADR-002](../architecture/adr/ADR-002-complete-shopify-catalog-migration.md). Ни один из них не требует изменений этим модулем. Кандидаты на **новые** ADR, обнаруженные при проектировании (решения не принимаются здесь, только фиксируется, что решение потребуется до реализации соответствующей части) — см. [`delivery-future-roadmap.md`](./delivery-future-roadmap.md), раздел «Кандидаты на ADR».

## Правила сопровождения документации

Те же правила, что уже действуют для `docs/admin-platform/` (см. [`docs/admin-platform/README.md`](../admin-platform/README.md), «Правила сопровождения документации») — единый заголовок, версионирование `0.x → 1.0` при переходе к реализации, дата обновления при изменении содержания, честная фиксация расхождений вместо тихой правки задним числом.

## Связанные документы вне этой папки

- [`docs/architecture/ARCHITECTURE_BASELINE_V1.md`](../architecture/ARCHITECTURE_BASELINE_V1.md) — официальный архитектурный эталон, которому подчиняется этот модуль
- [`docs/architecture/ARCHITECTURE_PRINCIPLES.md`](../architecture/ARCHITECTURE_PRINCIPLES.md), [`ARCHITECTURE_POLICY.md`](../architecture/ARCHITECTURE_POLICY.md), [`ARCHITECTURE_GUARD.md`](../architecture/ARCHITECTURE_GUARD.md)
- [`docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md`](../admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md), [`docs/admin-platform/IMPLEMENTATION_ORDER.md`](../admin-platform/IMPLEMENTATION_ORDER.md)
- [`docs/admin-platform/orders.md`](../admin-platform/orders.md) — Checkout уже сегодня вызывает `PricingService.calculateDeliveryFee`, точку интеграции с этим модулем
- [`docs/admin-platform/couriers.md`](../admin-platform/couriers.md) — будущее Курьерское PWA — потребитель зоны/ETA, спроектированных здесь

# Порядок реализации — Delivery Management & Pricing

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | План реализации — главный документ разработки модуля |
| **Дата последнего обновления** | 2026-08-02 (Этап 1 закрыт) |
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

## Этап 2 — Реализация ядра (не начат)

| Поле | Значение |
|---|---|
| **Статус этапа** | Не начат — требует отдельного, явно поставленного промпта |
| **Номер** | 2 |
| **Название** | Реализация ядра: география, стандартные тарифы, Rule Engine, интеграция с Checkout |
| **Цель** | Дать платформе рабочую, конфигурируемую через Административную платформу систему зон и стандартных тарифов, заменяющую сегодняшний `SupabaseDeliveryZoneRepository.calculateFee()`, без активации продвинутого ценообразования |
| **Предполагаемый объём** | Миграции: `cities`, `stores`, `delivery_zones` (расширение), `delivery_districts`, `delivery_tariffs` (+ миграция существующих `price`/`free_from` в записи `STANDARD`-тарифа, см. `delivery-pricing.md`, «Миграция с текущей модели»); `server/ports/{city,store,delivery-zone,delivery-district,delivery-tariff}.repository.ts`; `server/adapters/supabase/*` (реализации); `server/domain/delivery/{delivery-zone-policy,delivery-tariff-policy}/*` (Rule Engine по стандарту, `delivery-rule-engine.md`); `server/domain/delivery/{delivery-zone,delivery-tariff,delivery-pricing-engine,delivery-calculator}.service.ts`; `server/functions/delivery*.executor.ts`; `src/api/delivery*.{functions.ts,ts}`; `src/routes/admin/delivery/*`; замена вызова в `CheckoutService`/`PricingService` на `DeliveryPricingEngine` |
| **Явно НЕ входит в объём** | `pricingModel: BY_DISTANCE`, любые `DeliveryCoefficient`, `tariffType: CORPORATE`/`HOLIDAY`/`PROMOTIONAL` за пределами модели данных (сами правила `CorporateTariffRule`/`HolidayTariffRule` могут быть реализованы как часть Rule Engine, но без реальных провайдеров/данных, дающих им сработать за пределами `STANDARD`, — это Этап 3) |
| **Зависит от** | Кандидат на ADR №3 (`DeliveryCoefficientRegistry`) не блокирует Этап 2 — коэффициенты не активируются в нём |
| **Какие проверки должны быть выполнены** | typecheck, lint, tests, build, Architecture Guard |

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
| 2 | Реализация ядра | Не начат | Этап 1 |
| 3 | Продвинутое ценообразование | Не начат | Этап 2 + ADR №1/№2/№3 |

## Итоговое условие

Идентично уже принятому для Административной платформы (`docs/admin-platform/IMPLEMENTATION_ORDER.md`, «Итоговое условие»):

```
Этап N считается закрытым только при:
  typecheck ✅ → lint ✅ → tests ✅ → build ✅ → Architecture Guard ✅ (PASS) → commit
```

Этап не начинается, пока предыдущий не закрыт этим условием.

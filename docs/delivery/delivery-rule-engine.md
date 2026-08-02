# Rule Engine — Delivery Rule / Delivery Policy

| Поле | Значение |
|---|---|
| **Версия** | 0.1 |
| **Статус** | Черновая архитектура — не реализовано |
| **Дата последнего обновления** | 2026-08-02 |
| **Связанные документы** | [`delivery-pricing.md`](./delivery-pricing.md), [`delivery-zones.md`](./delivery-zones.md) |
| **Связанные ADR** | нет (сам движок — переиспользование уже принятого стандарта, ADR не требуется; см. `delivery-future-roadmap.md` для смежных решений, которые ADR требуют) |
| **Связанные Architecture Principles** | PL-12 (Rule Engine Standard) — этот документ его не переопределяет, только применяет |

---

**Модуль:** Delivery Management & Pricing — Rule Engine
**Статус в коде:** не существует
**Роли с доступом:** н/п (внутренний механизм Domain, не имеет собственного UI)

> Этот документ проектирует **два** Rule Engine, оба строго по стандарту `docs/principles/12-rule-engine-standard.md` (`order → applies → evaluate → terminal`), без единого `if`-выражения, выбирающего бизнес-исход, снаружи зарегистрированных правил.

## Почему два движка, а не один

`DeliveryZonePolicyService` и `DeliveryTariffPolicyService` решают семантически разные вопросы («можно ли доставить» vs. «по какому тарифу») и оперируют разными правилами разного жизненного цикла (правила зоны меняются редко и глобально; правила выбора тарифа — предмет частой конфигурации маркетингом). Это то же самое разделение, что уже применяется в `CheckoutService`: `PaymentPolicyService` и `OrderLifecyclePolicy` — два отдельных движка, не один общий, хотя оба вызываются из одного оркестратора. Слияние в один движок потребовало бы искусственного общего `TContext`/`TResult`, скрывающего разницу вопросов «допустимо?» и «какой из вариантов?».

## Delivery Zone Policy — допустимость доставки

**Порт:**

```typescript
interface DeliveryZonePolicyContext {
  zoneId: string;
  subtotal: number;
}

interface DeliveryZonePolicyResult {
  allowed: boolean;
  denialCode?: string;
  message?: string;
}

interface IDeliveryZonePolicy {
  can(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult;
  assert(context: DeliveryZonePolicyContext): void; // throws on denied
}
```

**Правило (`DeliveryZoneRule`):**

```typescript
interface DeliveryZoneRule {
  readonly order: number;
  readonly terminal?: boolean; // default: true
  applies(context: DeliveryZonePolicyContext): boolean;
  evaluate(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult;
}
```

**Именованный порядок (`delivery-zone-policy-order.ts`):**

```typescript
export const DeliveryZonePolicyOrder = {
  ZONE_ACTIVE: 10,
  MIN_ORDER_AMOUNT: 20,
  ALLOW: 90, // терминальное правило-фолбэк: если дошли сюда — разрешено
} as const;
```

**Правила:**

| Правило | `order` | `terminal` | `applies()` | `evaluate()` |
|---|---|---|---|---|
| `ZoneActiveRule` | 10 | `true` | всегда | `denied` если зона неактивна, иначе `continue` (правило не терминально «в смысле успеха» — оно терминально только на отказе; при `allowed` движок по стандарту тоже остановился бы — здесь это осознанно нежелательно, поэтому правило возвращает `evaluate` только при отказе и не помечает себя `applies()`-истинным при активной зоне, передавая очередь дальше) |
| `MinOrderAmountRule` | 20 | `true` (тот же принцип — реально терминально только при отказе) | тариф зоны задаёт `minOrderAmount` | `denied` если `subtotal < minOrderAmount` |
| `AllowRule` | 90 | `true` | всегда | `allowed: true` — явный терминальный фолбэк, а не «пустой цикл = allow» по умолчанию |

**Важное уточнение семантики:** алгоритм Принципа 12 останавливается на первом `!allowed` (немедленный deny) независимо от `terminal`, поэтому `ZoneActiveRule`/`MinOrderAmountRule` естественным образом не блокируют движение дальше при успехе — стандартный алгоритм уже это гарантирует (см. `docs/principles/12-rule-engine-standard.md`, «Алгоритм движка», шаг 3–4). Явный `AllowRule` на `order: 90` — не костыль, а прямое соответствие тому, как уже спроектирован `DiscountPolicyOrder.COMPUTE_AMOUNT` (терминальный финальный шаг, а не подразумеваемое поведение «ничего не сработало = ок»): без него отсутствие совпавших правил вернуло бы `NO_MATCHING_RULE` (deny) по определению алгоритма — обратное тому, что нужно для «допуска по умолчанию».

## Delivery Tariff Policy — выбор применимого тарифа

**Порт:**

```typescript
interface DeliveryTariffPolicyContext {
  zoneId: string;
  cityId: string;
  orderDate: string;      // ISO — для HOLIDAY/PROMOTIONAL окна
  customerSegment?: "RETAIL" | "CORPORATE";
}

interface DeliveryTariffPolicyResult {
  allowed: boolean;
  denialCode?: string;
  tariff?: DeliveryTariffDTO;
}

interface IDeliveryTariffPolicy {
  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult;
}
```

**Именованный порядок (`delivery-tariff-policy-order.ts`):**

```typescript
export const DeliveryTariffPolicyOrder = {
  CORPORATE: 10,
  HOLIDAY: 20,
  PROMOTIONAL: 30,
  STANDARD_FALLBACK: 90,
} as const;
```

**Правила:**

| Правило | `order` | `terminal` | `applies()` | `evaluate()` |
|---|---|---|---|---|
| `CorporateTariffRule` | 10 | `true` | `context.customerSegment === "CORPORATE"` и для зоны существует активный тариф `tariffType: CORPORATE` | `allowed: true, tariff: <найденный корпоративный тариф>` |
| `HolidayTariffRule` | 20 | `true` | существует активный `HOLIDAY`-тариф зоны с `validFrom <= orderDate <= validTo` | `allowed: true, tariff: <найденный праздничный тариф>` |
| `PromotionalTariffRule` | 30 | `true` | существует активный `PROMOTIONAL`-тариф зоны в текущем окне (управляется Admin-Marketing, `permissions.md`) | `allowed: true, tariff: <найденный акционный тариф>` |
| `StandardTariffFallbackRule` | 90 | `true` | всегда | Находит `tariffType: STANDARD` тариф зоны (или платформенный тариф по умолчанию, если `zoneId` тарифа `null` — см. `delivery-pricing.md`); `denied: NO_STANDARD_TARIFF`, если даже фолбэка нет — это конфигурационная ошибка администратора, не тихий 0 |

Порядок правил здесь — не произвольный: он прямо реализует приоритет, уже словесно описанный в `delivery-pricing.md` («Corporate → Holiday → Standard, см. приоритет») — единственное место, где этот приоритет **исполняется**, а не просто упоминается.

## Соответствие стандарту (чек-лист)

- ✅ `order: number` — оба движка используют именованные константы, не magic numbers.
- ✅ `terminal?: boolean` (default `true`) — обе интерфейс-декларации совпадают дословно с `docs/principles/12-rule-engine-standard.md`.
- ✅ `applies(context): boolean` / `evaluate(context): TResult` — присутствуют в обоих правилах.
- ✅ Универсальный движок (`sortRulesByOrder` + цикл `for` с ранним `return`) — идентичен по структуре уже существующему `DiscountPolicyService`, не переизобретён.
- ✅ Нет `if (tariffType === "CORPORATE")` внутри `DeliveryPricingEngine` — весь выбор инкапсулирован в зарегистрированных правилах.
- ✅ Новое правило = новый класс в `rules/` + константа в `*-order.ts` + регистрация в `server/di/container.ts` — без изменения оркестратора (`DeliveryPricingEngine`) или самого движка (`DeliveryTariffPolicyService`).

## Явно НЕ являются Rule Engine в смысле Принципа 12

`DeliveryCoefficientRegistry` (накопление нескольких коэффициентов) — спроектирован в `delivery-pricing.md` как отдельный, более простой механизм именно потому, что не соответствует семантике «одно правило побеждает». Смешивать его с `DeliveryZonePolicyService`/`DeliveryTariffPolicyService` в этом документе значило бы исказить оба понятия — граница проведена сознательно.

## Ссылки

- [`docs/principles/12-rule-engine-standard.md`](../principles/12-rule-engine-standard.md)
- [`delivery-pricing.md`](./delivery-pricing.md)
- Прецедент в коде: `server/domain/discount-policy/` (`discount-policy.rule.ts`, `discount-policy-order.ts`, `discount-policy.service.ts`) — структура этого документа воспроизводит его один в один

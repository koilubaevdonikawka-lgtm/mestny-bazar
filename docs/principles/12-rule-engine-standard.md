# Принцип 12: Rule Engine Standard

## Формулировка

Все Policy-модули с цепочкой правил используют **единый стандарт движка**:  
`order` → `applies` → `evaluate` → `terminal`.

Движок — универсальный; бизнес-правила живут в отдельных классах `rules/`.

## Интерфейс правила

```typescript
interface PolicyRule<TContext, TResult> {
  readonly order: number;
  readonly terminal?: boolean; // default: true
  applies(context: TContext): boolean;
  evaluate(context: TContext): TResult;
}
```

Конкретные Policy реализуют свой `*Rule` (например, `PaymentPolicyRule`, `OrderLifecycleRule`).

## Семантика

| Свойство | Назначение |
|----------|------------|
| `order` | Порядок выполнения (ascending). Значения — из `*-order.ts`, не magic numbers |
| `terminal` | `false` = guard: при `allowed` цепочка продолжается |
| `applies()` | Правило участвует в данном контексте? |
| `evaluate()` | Результат `allowed / denied` + `denialCode` |

## Алгоритм движка

1. Отсортировать правила по `order` (ascending)
2. Для каждого правила: если `applies()` — вызвать `evaluate()`
3. При `!allowed` — немедленный deny
4. При `allowed` и `terminal !== false` — немедленный allow
5. Если ни одно правило не сработало — deny с кодом `NO_MATCHING_RULE` / `UNKNOWN_*`

## API Policy (порт)

```typescript
interface IPolicy<TContext, TResult> {
  can(context: TContext): TResult;
  assert(context: TContext): void;
}
```

## Именованный порядок

```typescript
// payment-policy-order.ts
export const PaymentPolicyOrder = {
  GLOBAL_GUARD: 10,
  CASH_AUTH: 80,
  ONLINE: 90,
} as const;
```

Новое правило = новый класс в `rules/` + константа в `*-order.ts` + регистрация в container.

## Реализованные движки

| Policy | Сервис | Порт |
|--------|--------|------|
| Payment | `PaymentPolicyService` | `IPaymentPolicy` |
| Order Lifecycle | `OrderLifecycleService` | `IOrderLifecyclePolicy` |
| Product Publication | `ProductPublicationService` | `IProductPublicationPolicy` |

## Запрещено

- Хардкод порядка правил внутри `*.service.ts`
- `if (paymentMethod === "CASH")` в оркестраторах (`CheckoutService`, `OrderService`)
- Отдельные `factory.ts` для сборки rule chain

## Ссылки

- [10-policy-rule-engines.md](./10-policy-rule-engines.md)
- [05-composition-root.md](./05-composition-root.md)

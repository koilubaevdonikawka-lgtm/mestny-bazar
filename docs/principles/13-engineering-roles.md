# Принцип 13: Engineering Roles

## Формулировка

Каждый слой Platform Layer имеет **одну зону ответственности**.  
Сервис-оркестратор координирует workflow; Policy — решает «можно / нельзя»;  
Adapter — выполняет I/O; Frontend — только отображает DTO.

## Роли слоёв

| Слой | Путь | Ответственность | Запрещено |
|------|------|-----------------|-----------|
| Contracts | `shared/contracts/` | DTO, enums, API-ошибки | Импорт внешних SDK |
| Frontend | `src/**` (кроме `src/api/`) | UI, локальный state | `server/*`, data-запросы в Supabase/Shopify/Finik |
| API bridge | `src/api/` | Typed wrappers → `createServerFn` | Бизнес-логика, прямой доступ к БД |
| Transport | `server/functions/` | Валидация входа, вызов domain, маппинг DTO | SQL, HTTP к внешним API |
| Domain | `server/domain/` | Бизнес-правила через порты | `new Adapter()`, знание провайдера |
| Ports | `server/ports/` | Интерфейсы зависимостей | Реализация |
| Adapters | `server/adapters/` | Supabase, Finik, Telegram | Бизнес-решения |
| Composition Root | `server/di/container.ts` | Сборка зависимостей, rule chains, feature flags | Domain-логика |

## Роли сервисов (domain)

| Сервис | Знает | Не знает |
|--------|-------|----------|
| `CheckoutService` | Как оформить заказ, вызвать pricing/inventory/payment | Кому разрешён CASH, допустимые переходы статуса |
| `OrderService` | CRUD заказа, persistence через `IOrderRepository` | Матрицу переходов статусов, роли оператора |
| `PaymentPolicyService` | Цепочку правил оплаты | Детали checkout flow |
| `OrderLifecycleService` | Цепочку правил переходов | Как создаётся заказ |
| `CatalogService` | Чтение каталога через `IProductRepository` | Shopify vs Supabase (решает container) |

## Роли при code review

| Вопрос | Кто отвечает |
|--------|--------------|
| «Можно ли оплатить наличными?» | `PaymentPolicyService` |
| «Можно ли перейти CREATED → PAID?» | `OrderLifecycleService` |
| «Какой адаптер каталога?» | `container.ts` — единственный вариант, `SupabaseProductRepository` (ADR-002) |
| «Как выглядит заказ в UI?» | Frontend по `OrderDTO` |

## Правило делегирования

```
Frontend → src/api → server/functions → Domain Service → Port → Adapter
                                              ↓
                                        Policy Engine (can / assert)
```

Оркестратор вызывает `paymentPolicy.assertCanUsePaymentMethod()` —  
не проверяет условия сам.

## Ссылки

- [01-platform-layer.md](./01-platform-layer.md)
- [03-dependency-rule.md](./03-dependency-rule.md)
- [10-policy-rule-engines.md](./10-policy-rule-engines.md)
- [12-rule-engine-standard.md](./12-rule-engine-standard.md)

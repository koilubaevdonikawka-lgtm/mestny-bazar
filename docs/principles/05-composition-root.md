# Принцип 05: Composition Root

## Формулировка

Вся композиция зависимостей происходит **только** в `server/di/container.ts`.  
Отдельные factory-файлы для сборки сервисов не допускаются.

## Ответственность container

- Создание адаптеров
- Привязка портов к реализациям
- Регистрация rule chains (Payment Policy, Order Lifecycle)
- Выбор реализации по feature flag

## Запрещено

- `factory.ts` для Policy-сервисов
- `new Adapter()` внутри domain services
- Module-level singletons вне container

## Пример

```typescript
const paymentPolicy = new PaymentPolicyService([
  new CashRequiresAuthenticationRule(),
  new OnlineAllowedRule(),
]);
```

## Ссылки

- [03-dependency-rule.md](./03-dependency-rule.md)
- [10-policy-rule-engines.md](./10-policy-rule-engines.md)

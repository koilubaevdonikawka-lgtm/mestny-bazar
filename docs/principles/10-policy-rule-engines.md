# Принцип 10: Policy Rule Engines

## Формулировка

Сквозная бизнес-логика «можно / нельзя» выносится в **Policy-модули**  
с универсальным движком правил, а не в сервисы-оркестраторы.

## Структура Policy-модуля

```
server/
  ports/          ← IPolicy (can / assert)
  domain/
    <policy>/
      *.service.ts    ← движок (сортировка, цепочка, terminal)
      *.rule.ts       ← интерфейс правила
      *-order.ts      ← именованные константы order
      rules/          ← реализации правил
```

## Механизм

| Свойство | Назначение |
|----------|------------|
| `order` | Порядок выполнения (ascending) |
| `terminal` | `false` = guard продолжает цепочку |
| `applies()` | Правило участвует в контексте? |
| `evaluate()` | Результат `allowed / denied` |

## Реализованные Policy

| Policy | Примеры правил |
|--------|----------------|
| Payment | `OnlineAllowedRule`, `CashRequiresAuthenticationRule` |
| Order Lifecycle | цепочка в container (пока `[]`) |

## Ссылки

- [12-rule-engine-standard.md](./12-rule-engine-standard.md)
- [13-engineering-roles.md](./13-engineering-roles.md)
- [05-composition-root.md](./05-composition-root.md)

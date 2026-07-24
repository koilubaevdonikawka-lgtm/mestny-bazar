# Принцип 02: Ports & Adapters

## Формулировка

Внешние системы (Supabase, Finik, Telegram, Shopify) подключаются **только** через адаптеры,  
реализующие порты (интерфейсы) в `server/ports/`.

## Слои

```
Domain Service → Port (interface) → Adapter → External System
```

## Правила

- Порт описывает **что** нужно домену, не **как** это реализовано
- Адаптер знает детали API/БД, домен — нет
- Смена провайдера = новый адаптер, без изменения domain

## Примеры портов

- `IProductRepository`
- `IOrderRepository`
- `IPaymentProvider`
- `INotificationProvider`

## Ссылки

- [ADR-001](../adr/ADR-001-ports-and-adapters.md)

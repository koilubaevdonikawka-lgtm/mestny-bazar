# Принцип 09: Replaceable Adapters

## Формулировка

Любой внешний сервис должен быть заменяем **без изменения** domain services и frontend.

## Заменяемые компоненты

| Компонент | Порт | Текущий адаптер |
|-----------|------|-----------------|
| Каталог | `IProductRepository` | Supabase / Shopify (migration) |
| Заказы | `IOrderRepository` | Supabase |
| Оплата | `IPaymentProvider` | Finik |
| Уведомления | `INotificationProvider` | Telegram / WhatsApp |
| Storage | `IStorageService` | Supabase Storage |

## Критерий замены

Смена провайдера = новый файл в `server/adapters/` + wiring в container.  
Domain, contracts, frontend — без изменений.

## Migration adapters

Временные адаптеры (`server/adapters/migration/`)  
удаляются после полной миграции (Stage 9).

## Ссылки

- [02-ports-and-adapters.md](./02-ports-and-adapters.md)
- [11-feature-flags.md](./11-feature-flags.md)

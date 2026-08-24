# Принцип 11: Feature Flags

## Формулировка

Параллельный запуск старого и нового поведения — через feature flags,  
не через ветвление в UI или domain.

## Текущие флаги

- `FEATURE_CUSTOMER_CANCELLATION` / `VITE_FEATURE_CUSTOMER_CANCELLATION` (Задача №133, по умолчанию выключено) — включает/выключает самостоятельную отмену заказа покупателем (2-минутное окно). Composition Root (`server/di/container.ts`) читает серверный флаг и передаёт булево значение в конструктор `CustomerCancelOrderRule` — сам rule env не читает. Клиентский `VITE_`-флаг (`src/components/CancelOrderButton.tsx`) отдельно скрывает таймер/кнопку в UI покупателя; сервер всё равно перепроверяет через rule независимо от UI. Временная приглушка по решению архитектора — вся логика отмены (rule, окно, UI) остаётся в коде нетронутой, включается обратно одним значением.

`FEATURE_CATALOG_SOURCE`/`VITE_FEATURE_CATALOG_SOURCE` и `FEATURE_CHECKOUT_SOURCE`/`VITE_FEATURE_CHECKOUT_SOURCE` были удалены целиком по завершении миграции каталога — [ADR-002](../architecture/adr/ADR-002-complete-shopify-catalog-migration.md). `SupabaseProductRepository` — безусловная, единственная реализация `IProductRepository` в `server/di/container.ts`.

## Правила

- Выбор адаптера — в Composition Root по флагу, если такой флаг вообще существует
- Domain service **не** читает env напрямую
- Флаг существует только пока есть более одного реального варианта выбирать между собой; когда остаётся один — флаг и неиспользуемая ветка удаляются вместе (не оставляются «на будущее» без конкретной новой причины, см. ADR-002 «Alternatives considered»)

## Миграция (завершена)

```
Stage 3: platform catalog доступен по флагу ✅
Stage 9: platform по умолчанию, Shopify удалён ✅ (ADR-002)
```

## Ссылки

- [09-replaceable-adapters.md](./09-replaceable-adapters.md)
- [architecture.md](../architecture.md)

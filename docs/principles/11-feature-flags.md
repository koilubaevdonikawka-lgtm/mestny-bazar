# Принцип 11: Feature Flags

## Формулировка

Параллельный запуск старого и нового поведения — через feature flags,  
не через ветвление в UI или domain.

## Текущие флаги

Нет активных флагов. `FEATURE_CATALOG_SOURCE`/`VITE_FEATURE_CATALOG_SOURCE` и `FEATURE_CHECKOUT_SOURCE`/`VITE_FEATURE_CHECKOUT_SOURCE` были единственными и удалены целиком по завершении миграции каталога — [ADR-002](../architecture/adr/ADR-002-complete-shopify-catalog-migration.md). `SupabaseProductRepository` — безусловная, единственная реализация `IProductRepository` в `server/di/container.ts`.

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

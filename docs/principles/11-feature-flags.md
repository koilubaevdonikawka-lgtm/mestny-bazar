# Принцип 11: Feature Flags

## Формулировка

Параллельный запуск старого и нового поведения — через feature flags,  
не через ветвление в UI или domain.

## Текущие флаги

| Флаг | Значения | Назначение |
|------|----------|------------|
| `FEATURE_CATALOG_SOURCE` | `shopify` / `platform` | Источник каталога |
| `VITE_FEATURE_CATALOG_SOURCE` | зеркало для UI | Отображение в client |

## Правила

- Выбор адаптера — в Composition Root по флагу
- Domain service **не** читает env напрямую
- Default: `shopify` (текущее поведение витрины)

## Миграция

```
Stage 3: platform catalog доступен по флагу
Stage 9: platform по умолчанию, Shopify удалён
```

## Ссылки

- [09-replaceable-adapters.md](./09-replaceable-adapters.md)
- [architecture.md](../architecture.md)

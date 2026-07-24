# Принцип 06: Import Boundaries

## Формулировка

Границы слоёв фиксируются ESLint `no-restricted-imports`  
и path aliases (`@shared/*`, `@server/*`).

## Матрица импортов

| From | May import |
|------|------------|
| `src/**` (кроме `src/api/`) | `shared/`, `src/api/` |
| `src/api/` | `shared/`, `@server/functions/*` |
| `server/**` | `shared/`, `server/` |

## Исключения

- `src/integrations/supabase/` — legacy auth (временно)
- `src/api/` — мост к server functions

## Цель

Предотвратить «просачивание» Supabase и server-кода в client bundle.

## Ссылки

- [01-platform-layer.md](./01-platform-layer.md)
- [08-storage-as-detail.md](./08-storage-as-detail.md)

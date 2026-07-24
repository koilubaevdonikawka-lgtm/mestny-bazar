# Принцип 01: Platform Layer

## Формулировка

Frontend взаимодействует с данными **только** через Platform API (`src/api/` → `server/functions/`).  
Прямые вызовы внешних сервисов из браузера запрещены.

## Почему

- Секреты остаются на сервере
- Бизнес-логика централизована
- Frontend заменяем без переписывания домена

## Правила

| Разрешено в `src/` | Запрещено в `src/` |
|--------------------|--------------------|
| `shared/contracts/` | `@supabase/supabase-js` (data) |
| `src/api/*` | Shopify / Finik API |
| UI-state (Zustand) | `server/domain`, `server/adapters` |

## Исключение

Supabase Auth JWT на клиенте допустим **только** для получения сессии.  
Все data-операции — через server functions.

## Ссылки

- [architecture.md](../architecture.md)
- [ADR-001](../adr/ADR-001-ports-and-adapters.md)

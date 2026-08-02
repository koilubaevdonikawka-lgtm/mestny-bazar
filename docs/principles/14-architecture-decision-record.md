# Принцип 14: Architecture Decision Record

## Формулировка

Значимые архитектурные решения фиксируются в **ADR** (`docs/adr/`).  
ADR — обязательный артефакт перед внедрением решения, влияющего на границы слоёв,  
заменяемость провайдеров или поток данных.

## Когда писать ADR

| Ситуация | ADR нужен |
|----------|-----------|
| Новый внешний провайдер (платёж, уведомления) | Да |
| Изменение правила импортов между слоями | Да |
| Прямой доступ frontend к БД / API | Да (обычно Rejected) |
| Рефакторинг одного адаптера без смены порта | Нет |
| Косметика UI | Нет |

## Формат ADR

```markdown
# ADR-NNN: Краткий заголовок

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Context:** Местный Базар

## Problem
## Decision
## Consequences
### Positive
### Negative
## Alternatives considered
## Implementation notes
## References
```

## Нумерация и статусы

- Файл: `docs/adr/ADR-NNN-kebab-title.md`
- `Accepted` — действующее решение, код должен ему соответствовать
- `Superseded by ADR-XXX` — заменено новым ADR, не удалять (история)
- Принципы в `docs/principles/` **не заменяют** ADR: принципы — стандарты, ADR — конкретные решения

## Принятые ADR

| ADR | Решение | Статус |
|-----|---------|--------|
| [ADR-001](../adr/ADR-001-ports-and-adapters.md) | Ports & Adapters Platform Layer | Accepted |
| [ADR-002](../architecture/adr/ADR-002-complete-shopify-catalog-migration.md) | Завершение миграции каталога — Supabase единственный источник | Accepted |

## Связь с принципами

- Принципы 01–13 задают **как** строить систему
- ADR фиксирует **что** выбрано в конкретной ситуации и **почему**
- При конфликте кода и ADR — либо исправить код, либо новый ADR с обоснованием

## Ссылки

- [architecture.md](../architecture.md)
- [PROJECT_STANDARDS.md](../PROJECT_STANDARDS.md)
- [ADR-001: Ports & Adapters](../adr/ADR-001-ports-and-adapters.md)

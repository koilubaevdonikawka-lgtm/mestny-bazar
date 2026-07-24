# Архитектурные принципы — «Местный Базар»

Набор из 14 принципов, определяющих стандарты разработки проекта.  
Каждый принцип — отдельный документ с формулировкой, правилами и ссылками.

Сводный документ: [PROJECT_STANDARDS.md](../PROJECT_STANDARDS.md)

---

## Оглавление

| # | Принцип | Файл |
|---|---------|------|
| 01 | Platform Layer | [01-platform-layer.md](./01-platform-layer.md) |
| 02 | Ports & Adapters | [02-ports-and-adapters.md](./02-ports-and-adapters.md) |
| 03 | Dependency Rule | [03-dependency-rule.md](./03-dependency-rule.md) |
| 04 | DTO Contracts | [04-dto-contracts.md](./04-dto-contracts.md) |
| 05 | Composition Root | [05-composition-root.md](./05-composition-root.md) |
| 06 | Import Boundaries | [06-import-boundaries.md](./06-import-boundaries.md) |
| 07 | Server-Only Secrets | [07-server-only-secrets.md](./07-server-only-secrets.md) |
| 08 | Storage as Implementation Detail | [08-storage-as-detail.md](./08-storage-as-detail.md) |
| 09 | Replaceable Adapters | [09-replaceable-adapters.md](./09-replaceable-adapters.md) |
| 10 | Policy Rule Engines | [10-policy-rule-engines.md](./10-policy-rule-engines.md) |
| 11 | Feature Flags | [11-feature-flags.md](./11-feature-flags.md) |
| 12 | Rule Engine Standard | [12-rule-engine-standard.md](./12-rule-engine-standard.md) |
| 13 | Engineering Roles | [13-engineering-roles.md](./13-engineering-roles.md) |
| 14 | Architecture Decision Record | [14-architecture-decision-record.md](./14-architecture-decision-record.md) |

---

## Группы принципов

### Слои и зависимости (01–06)

Фундамент архитектуры: Platform Layer, порты, DI, границы импортов.

### Безопасность и данные (07–08)

Секреты на сервере, Supabase как деталь реализации.

### Расширяемость (09–11)

Заменяемые адаптеры, policy engines, feature flags.

### Стандарты разработки (12–14)

Единый движок правил, роли слоёв и сервисов, процесс ADR.

---

## Связанные документы

- [architecture.md](../architecture.md) — обзор архитектуры
- [ADR-001](../adr/ADR-001-ports-and-adapters.md) — решение о Platform Layer
- [stage-1-checklist.md](../stage-1-checklist.md) — чеклист Этапа 1

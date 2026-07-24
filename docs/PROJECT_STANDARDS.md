# Project Standards — «Местный Базар»

Этот документ — единая точка входа в архитектурные стандарты проекта.  
Все решения при разработке должны соответствовать перечисленным принципам.

Полный набор: [principles/README.md](./principles/README.md)

---

## 14 принципов

### Слои и зависимости

1. **[Platform Layer](./principles/01-platform-layer.md)** — frontend взаимодействует с данными только через Platform API; прямые вызовы внешних сервисов из браузера запрещены.

2. **[Ports & Adapters](./principles/02-ports-and-adapters.md)** — внешние системы подключаются через адаптеры, реализующие порты в `server/ports/`.

3. **[Dependency Rule](./principles/03-dependency-rule.md)** — domain зависит от портов, никогда от конкретных адаптеров.

4. **[DTO Contracts](./principles/04-dto-contracts.md)** — frontend знает только DTO из `shared/contracts/`; имена провайдеров и типы БД не просачиваются в UI.

5. **[Composition Root](./principles/05-composition-root.md)** — вся композиция зависимостей только в `server/di/container.ts`; отдельные factory-файлы не допускаются.

6. **[Import Boundaries](./principles/06-import-boundaries.md)** — границы слоёв фиксируются ESLint и path aliases.

### Безопасность и данные

7. **[Server-Only Secrets](./principles/07-server-only-secrets.md)** — API-ключи и service role keys никогда не попадают в client bundle.

8. **[Storage as Implementation Detail](./principles/08-storage-as-detail.md)** — Supabase — деталь реализации; data-операции только через server adapters.

### Расширяемость

9. **[Replaceable Adapters](./principles/09-replaceable-adapters.md)** — смена внешнего провайдера = новый адаптер, без изменения domain и frontend.

10. **[Policy Rule Engines](./principles/10-policy-rule-engines.md)** — сквозная логика «можно / нельзя» выносится в Policy-модули с универсальным движком правил.

11. **[Feature Flags](./principles/11-feature-flags.md)** — параллельный запуск старого и нового поведения через env-флаги, не через ветвление в UI.

### Стандарты разработки

12. **[Rule Engine Standard](./principles/12-rule-engine-standard.md)** — единый контракт правил (`order`, `terminal`, `applies`, `evaluate`) для Payment Policy и Order Lifecycle.

13. **[Engineering Roles](./principles/13-engineering-roles.md)** — зоны ответственности слоёв и сервисов; оркестраторы не содержат policy-логику.

14. **[Architecture Decision Record](./principles/14-architecture-decision-record.md)** — значимые архитектурные решения фиксируются в `docs/adr/` по единому формату.

---

## Быстрая проверка (code review)

| Вопрос | Принцип |
|--------|---------|
| Frontend вызывает Supabase `.from()`? | 01, 08 |
| Domain создаёт `new SupabaseX()`? | 03, 05 |
| В DTO есть `finikPaymentUrl`? | 04 |
| Секрет в `src/` или `VITE_*`? | 07 |
| `if (paymentMethod === "CASH")` в CheckoutService? | 10, 12, 13 |
| Статус меняется в OrderService без LifecyclePolicy? | 10, 12, 13 |
| Новый адаптер без порта? | 02, 09 |
| Factory вне container? | 05 |
| Архитектурное решение без ADR? | 14 |

---

## Связанные документы

- [architecture.md](./architecture.md)
- [ADR-001: Ports & Adapters](./adr/ADR-001-ports-and-adapters.md)
- [stage-1-checklist.md](./stage-1-checklist.md)

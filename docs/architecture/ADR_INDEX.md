# Индекс ADR (Architecture Decision Records)

Этот файл — **только индекс**. Здесь не описываются сами решения (это делает файл конкретного ADR), только его номер, заголовок, статус и однострочное краткое описание для быстрого поиска.

Формат и правила именования — `docs/principles/14-architecture-decision-record.md` (Принцип 14). Разница между ADR и Architecture Principles — см. [`README.md`](./README.md).

Новые ADR в рамках этой задачи **не создавались** — ниже подготовлена только структура индекса с реально существующим ADR-001 и зарезервированными слотами для будущих решений.

---

## Расположение файлов ADR (переходное примечание)

Единственный существующий ADR физически лежит в **`docs/adr/ADR-001-ports-and-adapters.md`** — это исторически сложившееся расположение, на которое ссылаются `docs/principles/*.md`, `docs/architecture.md`, `docs/PROJECT_STANDARDS.md` и `ARCHITECTURE_PRINCIPLES.md` (более десятка перекрёстных ссылок).

Каталог **`docs/architecture/adr/`** создан как **целевое расположение для новых ADR**, начиная с ADR-002 — так вся архитектурная документация в перспективе консолидируется под `docs/architecture/`. Существующий ADR-001 **не был перемещён** в рамках этой задачи, чтобы не сломать существующие ссылки в других документах без отдельного, осознанного решения об этом переносе (это несложная, но отдельная правка, которую имеет смысл делать сразу по всем файлам-источникам, а не только здесь).

> Если понадобится физически перенести историю ADR полностью под `docs/architecture/adr/`, это стоит сделать отдельным шагом с обновлением всех ссылок разом — сообщите, и это будет сделано.

---

## Индекс

| ADR | Заголовок | Статус | Краткое описание |
|---|---|---|---|
| [ADR-001](../adr/ADR-001-ports-and-adapters.md) | Ports & Adapters Platform Layer | **Accepted** (2026-07-16) | Вводит Platform Layer между frontend и всеми внешними сервисами: Contracts / Ports / Adapters / Domain services / Transport / Frontend API. Отклоняет прямое чтение каталога через Supabase RLS с фронтенда (план Lovable) и big-bang-переписывание без Ports & Adapters. |
| [ADR-002](./adr/ADR-002-complete-shopify-catalog-migration.md) | Завершение миграции каталога — Supabase единственный источник | **Accepted** (2026-08-02) | Закрывает временное состояние «dual catalog», принятое ADR-001. Удаляет `ShopifyCatalogAdapter`, `FEATURE_CATALOG_SOURCE`/`FEATURE_CHECKOUT_SOURCE`, `src/lib/shopify.ts`. `SupabaseProductRepository` — единственная реализация `IProductRepository`. |
| [ADR-003](./adr/ADR-003-geocoding-provider.md) | Провайдер геокодирования для BY_DISTANCE | **Accepted** (2026-08-09) | Выбирает 2GIS Geocoder API как реализацию будущего `IGeocodingProvider` (Delivery Management & Pricing, Подэтап 1 из `delivery-future-roadmap.md`, кандидат №1). Google Maps, Yandex Geocoder и OSM/Nominatim рассмотрены и отклонены — обоснование в самом ADR. Код не создавался — только выбор провайдера. |
| ADR-004 | *(не создан)* | — | *(зарезервировано)* |
| ADR-NNN | *(не создан)* | — | *(добавляйте новые строки по мере создания ADR — см. `docs/principles/14-architecture-decision-record.md` о том, когда ADR обязателен)* |

---

## Известные кандидаты на будущий ADR (не решения — только зафиксированные пробелы)

Ниже — ситуации, для которых по критериям Принципа 14 ADR **должен был бы существовать**, но не был создан. Это не предложение содержания решения, а фиксация пробела, обнаруженного при восстановлении `ARCHITECTURE_PRINCIPLES.md` (раздел «Missing principles»). Создание ADR по любому из пунктов — отдельная задача, не выполнявшаяся в рамках этой.

| Кандидат | Почему считается пробелом | Источник |
|---|---|---|
| Удаление «осиротевшего» composition root (~4600 файлов: `server/application`, `server/infrastructure`, `server/platform`, `server/bootstrap` и др.) | Решение материально затронуло границы слоёв и композицию зависимостей — по Принципу 14 это прямой повод для ADR. Задокументировано только нарративно, в аудиторском отчёте, не в ADR-формате | `ARCHITECTURE_AUDIT.md` (находки F1/F2/F3/F6), `ARCHITECTURE_AUDIT_RESOLUTION.md` |
| Усиление ESLint-границ зависимостей внутри `server/**` (не только `src/` → `server/`) | Изменение правила импортов между слоями — по таблице Принципа 14 такое изменение требует ADR | `ARCHITECTURE_AUDIT.md`, находка F9 |

---

## Связанные документы

- [`README.md`](./README.md) — назначение раздела, разница между принципами и ADR
- [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) — свод восстановленных архитектурных принципов
- [`../principles/14-architecture-decision-record.md`](../principles/14-architecture-decision-record.md) — формат и правила ADR

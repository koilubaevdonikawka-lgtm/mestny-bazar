# Местный Базар (Everyday Eats Hub)

Локальный food-маркетплейс: каталог, продавцы, заказы, доставка, оплата, административные и складские сценарии. Построен на **TanStack Start** (React 19) поверх **Supabase** (Postgres + Auth), с временным параллельным источником каталога/checkout через **Shopify** на время миграции.

## Стек

- **Frontend/SSR**: TanStack Start, React 19, TanStack Router/Query, Tailwind CSS
- **Backend**: TanStack Start server functions (`createServerFn`), Ports & Adapters (см. [`docs/architecture.md`](docs/architecture.md))
- **База данных**: Supabase (Postgres, RLS, миграции в [`supabase/migrations/`](supabase/migrations))
- **Валидация**: Zod (`shared/validation/`)
- **Тесты**: Vitest
- **Деплой**: Cloudflare Workers через Nitro (`cloudflare-module` preset)

## Архитектура

Проект следует **Ports & Adapters** (гексагональная архитектура): frontend — тонкий презентационный слой, вся бизнес-логика и внешние интеграции — в `server/`. Единая точка композиции зависимостей — `server/di/container.ts`.

```
Browser (src/)
    ↓ DTO-контракты
Platform API (src/api/ → server/functions/)
    ↓ порты (интерфейсы)
Domain services (server/domain/)
    ↓ адаптеры
Supabase | Shopify (временно) | Finik (заглушка)
```

Подробности:
- [`docs/architecture.md`](docs/architecture.md) — техническая архитектура, границы слоёв, этапы миграции
- [`docs/PROJECT_STANDARDS.md`](docs/PROJECT_STANDARDS.md) — 14 архитектурных принципов проекта
- [`docs/adr/`](docs/adr) — Architecture Decision Records

Документы в `docs/architecture/` (`ARCHITECTURE_POLICY.md`, `ONBOARDING_BOUNDARY.md`) описывают **будущее развитие** платформы (Loyalty, Experience Engine, партнёрская экосистема) — это продуктовое видение следующих версий, не текущая реализация.

## Быстрый старт

```bash
npm install
cp .env.example .env   # заполнить обязательные переменные — см. ниже
npm run dev
```

Приложение поднимется на первом свободном порту начиная с `8080` (см. вывод команды).

## Переменные окружения

Полный шаблон — [`.env.example`](.env.example). Валидация — [`server/config/env.ts`](server/config/env.ts).

**Обязательные** (без них приложение не запустится — падает с понятной ошибкой конфигурации, не с крашем внутри случайного запроса):

| Переменная | Назначение |
|---|---|
| `SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role ключ — используется всеми server-side репозиториями (заказы, адреса, товары продавцов, аудит-лог) независимо от feature-флагов |

**Опциональные** (имеют значения по умолчанию либо относятся к ещё не подключённым интеграциям — Finik/Telegram/WhatsApp сейчас заглушки, см. `server/adapters/payment/finik.adapter.ts` и `server/adapters/notifications/stub-notification.adapter.ts`): всё остальное в `.env.example`.

Клиентские переменные (`VITE_*`) попадают в браузерный бандл — туда не должно уходить ничего чувствительнее publishable/anon-ключа.

## Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | Dev-сервер (Vite) |
| `npm run build` | Production-сборка (Nitro → Cloudflare Workers, `.output/`) |
| `npm run preview` | Просмотр production-сборки |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (покрывает `server/**` и `shared/**`) |
| `npm run format` | Prettier |

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) прогоняет `typecheck` → `lint` → `test` → `build` на каждый push в `main` и на каждый pull request. Секреты не требуются — сборка и тесты не обращаются к реальному Supabase. Обязательность прохождения проверки перед merge (branch protection) настраивается отдельно в настройках репозитория GitHub.

## Тестирование

`npm run test` покрывает `server/**` и `shared/**` (доменная логика, репозитории, валидация, observability). Конфигурация — [`vitest.config.ts`](vitest.config.ts), намеренно отделена от `vite.config.ts` (последний тянет SSR/build-плагины TanStack Start, не нужные юнит-тестам).

## Деплой

Сборка (`npm run build`) генерирует Cloudflare Workers-совместимый вывод в `.output/` через Nitro (`cloudflare-module` preset), включая `.output/server/wrangler.json`. Деплой:

```bash
npx nitro deploy --prebuilt
```

## Известные ограничения

- **Оплата (Finik)** — заглушка, см. `server/adapters/payment/finik.adapter.ts` (Stage 7)
- **Уведомления (Telegram/WhatsApp)** — заглушка, см. `server/adapters/notifications/stub-notification.adapter.ts` (Stage 8)
- **Rate limiting** — не реализован, требует инфраструктуры (Cloudflare Rate Limiting Rules / KV)
- **APM/error tracking** — интеграционная точка готова (`shared/observability/logger.ts`), внешний сервис не подключён
- **Состояние миграций на реальной БД не подтверждено** — часть миграций в `supabase/migrations/` теоретически могла не примениться на данных с легаси-нарушениями (см. историю применения через `supabase migration list` перед продакшн-нагрузкой)
- Прогресс поэтапной миграции — [`docs/stage-1-checklist.md`](docs/stage-1-checklist.md), таблица стадий — [`docs/architecture.md`](docs/architecture.md#migration-stages)

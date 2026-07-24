# Принцип 07: Server-Only Secrets

## Формулировка

API-ключи, токены и service role keys **никогда** не попадают в client bundle.

## Server-only переменные

| Переменная | Назначение |
|------------|------------|
| `SHOPIFY_STOREFRONT_TOKEN` | Migration adapter |
| `SUPABASE_SERVICE_ROLE_KEY` | Repository adapters |
| `FINIK_API_KEY` | Payment adapter |
| `TELEGRAM_BOT_TOKEN` | Notifications |

## Client-safe переменные

| Переменная | Назначение |
|------------|------------|
| `VITE_SUPABASE_URL` | Auth client |
| `VITE_FEATURE_CATALOG_SOURCE` | UI feature flag |
| `VITE_APP_URL` | Meta, sitemap |

## Валидация

`server/config/env.ts` — Zod-схема для server env при старте.

## Ссылки

- [04-dto-contracts.md](./04-dto-contracts.md)

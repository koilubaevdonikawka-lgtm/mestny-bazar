# Принцип 08: Storage as Implementation Detail

## Формулировка

Supabase (Postgres, Auth, Storage) — **деталь реализации**,  
не часть публичного API приложения.

## Правила

- RLS-политики `anon SELECT` на каталог **не** используются из UI
- Все data-операции — через `server/adapters/supabase/`
- Маппинг `Database` row → DTO — только в адаптерах
- `src/integrations/supabase/types.ts` не импортируется из routes/components

## Отклонение от Lovable plan

`.lovable/plan.md` предлагает прямое чтение каталога через RLS.  
Этот принцип **отклоняет** такой подход.

## Auth exception

`supabase.auth.getSession()` на клиенте — только для JWT в server function RPC.

## Ссылки

- [01-platform-layer.md](./01-platform-layer.md)
- [ADR-001](../adr/ADR-001-ports-and-adapters.md)

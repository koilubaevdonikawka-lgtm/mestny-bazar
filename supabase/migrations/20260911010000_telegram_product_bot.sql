-- Задача №264 — Telegram bot for creating draft product cards from photos.
-- Server-only (Cloudflare Workers via the webhook handler in src/server.ts,
-- service-role Supabase client) — no direct client access to any of these
-- three tables, same pattern as push_broadcasts/device_tokens.

-- Allow-list of Telegram accounts the bot accepts commands from. Deliberately
-- no admin UI yet (explicitly out of scope) — pополняется вручную через SQL
-- until a real screen is built. Seeded with the one real admin now.
CREATE TABLE public.telegram_bot_admins (
  telegram_user_id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.telegram_bot_admins (telegram_user_id, name)
VALUES (7718528454, 'Данияр Койлубаев');

-- Per-chat "currently selected category/subcategory" — Workers are stateless
-- between requests, so this has to live in the DB, not process memory.
-- ON DELETE SET NULL (not CASCADE): a category being deleted shouldn't nuke
-- the session row, just leave the chat needing to pick a category again.
CREATE TABLE public.telegram_bot_sessions (
  telegram_chat_id BIGINT PRIMARY KEY,
  category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_telegram_bot_sessions_updated BEFORE UPDATE ON public.telegram_bot_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Idempotency guard for webhook redelivery: Telegram retries a webhook POST
-- (same update_id) whenever it doesn't get a fast 200 back — unlike the
-- Finik webhook (whose effect, setting an order's status, is naturally
-- idempotent), reprocessing a Telegram update here would create a second,
-- duplicate draft product. INSERT ... ON CONFLICT DO NOTHING before any
-- processing starts, checking rows-affected, gives an atomic "have I already
-- handled this one" check with no separate read-then-write race.
CREATE TABLE public.telegram_bot_processed_updates (
  update_id BIGINT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_bot_admins TO service_role;
GRANT ALL ON public.telegram_bot_sessions TO service_role;
GRANT ALL ON public.telegram_bot_processed_updates TO service_role;

ALTER TABLE public.telegram_bot_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_processed_updates ENABLE ROW LEVEL SECURITY;

-- Задача №266 — Telegram bot album (media_group_id) support. Cloudflare
-- Workers are stateless per-request and each photo in an album arrives as
-- its OWN separate webhook POST (sharing a media_group_id, but with no
-- explicit "this is the last one" signal from Telegram) — this buffers
-- album members across those separate requests and elects exactly one of
-- them (via telegram_bot_album_claims' PK uniqueness) to wait briefly and
-- then gather+process the whole group as a single product. Server-only,
-- same access pattern as the Задача №264 tables — no direct client access.

CREATE TABLE public.telegram_bot_album_members (
  media_group_id TEXT NOT NULL,
  message_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  file_id TEXT NOT NULL,
  caption TEXT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (media_group_id, message_id)
);

-- INSERT ... ON CONFLICT DO NOTHING on media_group_id (the PK) is the claim
-- itself: whichever of the album's separate webhook deliveries wins this
-- race becomes the one that waits and processes; every other delivery for
-- the same group just inserts its own member row above and returns.
CREATE TABLE public.telegram_bot_album_claims (
  media_group_id TEXT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_bot_album_members TO service_role;
GRANT ALL ON public.telegram_bot_album_claims TO service_role;

ALTER TABLE public.telegram_bot_album_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_album_claims ENABLE ROW LEVEL SECURITY;

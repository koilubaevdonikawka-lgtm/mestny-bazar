-- Persistent server-side cache for AI-generated text translations (Промпт
-- №094). Sits between the API layer and the existing, unmodified
-- AiTranslationService (server/domain/ai-translation.service.ts,
-- Промпт №088/089) — not a new column on any content table. The cache key
-- is a hash of the source text plus the language pair (source_text_hash,
-- source_language, target_language), never a foreign reference to a
-- specific category/product/row — so the same cache works for any content
-- and any number of languages. Editing a category's source name changes
-- its hash, so the old cached translation is naturally never looked up
-- again — no explicit invalidation step is required.
CREATE TABLE public.translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text_hash TEXT NOT NULL,
  source_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_translation_cache_key
  ON public.translation_cache (source_text_hash, source_language, target_language);

GRANT ALL ON public.translation_cache TO service_role;
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;
-- No policies granted to authenticated/anon: exclusively read/written by
-- server-side code via the service_role client (RLS-bypassing). Unlike
-- payments, there is no admin-visibility requirement for this table, so no
-- authenticated-role SELECT policy is added.

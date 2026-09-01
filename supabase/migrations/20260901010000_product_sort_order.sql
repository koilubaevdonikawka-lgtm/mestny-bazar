-- Fractional-indexed manual product ordering (Задача №230) — extends the
-- same idea already used for categories.sort_order, but as NUMERIC (not
-- INT): an admin must be able to insert a product between two existing ones
-- (e.g. 1 and 2) by assigning 1.1, without renumbering every other product.
-- No fixed precision/scale — arbitrary-precision NUMERIC supports repeated
-- subdivision (1.1, 1.11, 1.111, ...) indefinitely. Nullable: existing rows
-- are backfilled below, but a product created after this migration without
-- an explicit value stays NULL until an admin sets one (see
-- product.repository.ts's list() — NULLs sort after every numbered product,
-- by created_at desc).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sort_order NUMERIC;

COMMENT ON COLUMN public.products.sort_order IS
  'Fractional manual display order (nullable). NULL = not yet numbered, falls back to created_at desc, after every numbered product. Insert between two products by assigning a fraction (e.g. 1.1 between 1 and 2) — never renumber the rest.';

-- Backfill: assign sequential integers matching the storefront's current
-- default order (created_at desc — product.repository.ts's list(), pre-
-- existing default before this migration) so the visual order is unchanged
-- immediately after this runs — only the mechanism (explicit column instead
-- of an implicit created_at sort) changes.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.products
)
UPDATE public.products p
SET sort_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;

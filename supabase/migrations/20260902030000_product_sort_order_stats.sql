-- Задача №237 — reference-only aggregate for the product form's "Использовано
-- целых номеров" hint: the highest whole number already used as a
-- sort_order (or as the integer part of a fractional one), and how many
-- distinct whole numbers are represented across the catalog. Computed
-- entirely in Postgres via FLOOR()/COUNT(DISTINCT ...) over the real
-- numeric sort_order column — never JS Math.floor, same unbounded-precision
-- reasoning as next_product_sort_order() (Задача №231). max_whole is cast
-- to text for the same JSON-number-vs-string reason as sort_order_text:
-- PostgREST serializes text as a JSON string, so supabase-js's JSON.parse
-- never touches it as a number and can't round it. distinct_whole_count is
-- a plain small integer (a catalog-sized count, never an arbitrarily long
-- decimal) — no precision risk, returned as a real JSON number.
--
-- Only products with a set sort_order are counted; NULL rows (not yet
-- numbered) are excluded entirely rather than counted as a "0" group. An
-- aggregate over zero matching rows still returns exactly one row
-- (max_whole = null, distinct_whole_count = 0) — never an empty result set.
CREATE OR REPLACE FUNCTION public.product_sort_order_stats()
RETURNS TABLE (max_whole text, distinct_whole_count integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    MAX(FLOOR(sort_order))::text,
    COUNT(DISTINCT FLOOR(sort_order))::integer
  FROM public.products
  WHERE sort_order IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.product_sort_order_stats() TO service_role;

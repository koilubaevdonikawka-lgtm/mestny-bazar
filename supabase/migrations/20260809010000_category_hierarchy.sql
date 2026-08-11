-- Category hierarchy foundation (Stage 10, subcategory architecture).
-- Additive/nullable only — every existing row gets parent_id = NULL, which
-- means every existing category automatically stays a top-level category.
-- No data removed, no existing column/constraint touched.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- A category can never be its own parent. Multi-level cycles (A -> B -> A)
-- are not prevented at the constraint level (would require a recursive
-- check) but are handled defensively by the tree/ancestry read functions.
ALTER TABLE public.categories
  ADD CONSTRAINT categories_parent_not_self CHECK (parent_id IS NULL OR parent_id <> id);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

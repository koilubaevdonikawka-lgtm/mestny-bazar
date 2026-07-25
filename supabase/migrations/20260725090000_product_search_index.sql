-- Storefront search now calls the server (SupabaseProductRepository.list()'s
-- .ilike("name", `%term%`)) instead of filtering only the client's already-
-- loaded page of products. A leading-wildcard ILIKE can't use a plain btree
-- index, so without this the search would be a sequential scan over all
-- products on every keystroke (after debounce) as the catalog grows.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

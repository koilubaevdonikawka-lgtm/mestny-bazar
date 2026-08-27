-- Задача №182 — saved addresses now carry the same precise coordinates
-- already captured per-order (Задача №151/163, 20260825010000). Additive/
-- nullable, matching that same NUMERIC(9,6) precision (stores.lat/lng,
-- orders.delivery_latitude/longitude) — every existing address row and
-- every existing caller of the plain insert/update (no RPC involved here,
-- unlike orders) keeps working unchanged.
ALTER TABLE public.addresses
  ADD COLUMN latitude NUMERIC(9,6),
  ADD COLUMN longitude NUMERIC(9,6);

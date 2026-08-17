-- Extends delivery_zones with geography (docs/delivery/delivery-zones.md).
-- Additive, backfilled — no existing row's meaning changes.
ALTER TABLE public.delivery_zones ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE RESTRICT;
ALTER TABLE public.delivery_zones ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;

UPDATE public.delivery_zones SET city_id = (SELECT id FROM public.cities WHERE slug = 'bishkek')
WHERE city_id IS NULL;

ALTER TABLE public.delivery_zones ALTER COLUMN city_id SET NOT NULL;
-- store_id stays nullable: null = zone not tied to a specific store (today's
-- single-store reality), see delivery-zones.md, "Delivery Zone" table.

CREATE INDEX idx_delivery_zones_city ON public.delivery_zones(city_id);
CREATE INDEX idx_delivery_zones_store ON public.delivery_zones(store_id);

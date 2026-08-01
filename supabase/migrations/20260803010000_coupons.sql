-- Coupons (marketing.md) — a wholly new domain. DiscountPolicyService (Rule Engine,
-- PL-12) validates and computes the discount; the coupon row itself only stores the
-- rule's configuration data, never a computed price (CD-01 — price is always
-- recalculated server-side on every checkout, never trusted from a stored/cached value).
CREATE TYPE public.coupon_discount_type AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type public.coupon_discount_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order_total >= 0),
  max_uses INT CHECK (max_uses IS NULL OR max_uses > 0),
  uses_count INT NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);

GRANT SELECT, INSERT, UPDATE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_coupons_updated BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "coupons_admin_all" ON public.coupons
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- Atomic increment — two concurrent redemptions of the same coupon must not
-- both read uses_count=N and write N+1, silently losing one increment (the
-- same TOCTOU class atomic-stock-reservation already fixed for products.stock).
CREATE OR REPLACE FUNCTION public.increment_coupon_uses(p_coupon_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = p_coupon_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_uses(uuid) TO service_role;

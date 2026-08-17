-- Seller as a business entity (sellers.md) — distinct from ProfileDTO (general user
-- profile) and from the seller role in user_roles (which only grants product-management
-- access). Mirrors how AddressDTO augments the customer profile without merging into it.
CREATE TYPE public.seller_verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE public.seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  contact_phone TEXT,
  verification_status public.seller_verification_status NOT NULL DEFAULT 'PENDING',
  payout_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.seller_profiles TO authenticated;
GRANT ALL ON public.seller_profiles TO service_role;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_seller_profiles_updated BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "seller_profiles_select_own" ON public.seller_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "seller_profiles_select_admin" ON public.seller_profiles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "seller_profiles_insert_own" ON public.seller_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seller_profiles_update_own" ON public.seller_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

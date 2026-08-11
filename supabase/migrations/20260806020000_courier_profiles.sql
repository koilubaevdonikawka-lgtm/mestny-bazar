-- Couriers admin rebuild (Промпт №068): couriers today are only an auth.users
-- row + user_roles('courier') + a bare courier_status(is_available,
-- last_seen_at) row — no name/phone/vehicle/status anywhere. This adds the
-- real profile entity admin manages. Self-service PWA fields (courier_status)
-- are untouched; this table is admin-managed only (no authenticated write
-- policy), mirroring admin_scopes' sensitivity class.
CREATE TYPE public.courier_vehicle_type AS ENUM ('ON_FOOT', 'BICYCLE', 'MOTORCYCLE', 'CAR', 'OTHER');

-- Administrative status (can this person work at all), distinct from
-- courier_status.is_available (moment-to-moment presence toggle, the
-- courier's own PWA, unaffected by this table). A blocked courier must never
-- be assignable regardless of availability — enforced in
-- CourierAssignmentService.
CREATE TYPE public.courier_profile_status AS ENUM ('ACTIVE', 'BLOCKED');

CREATE TABLE public.courier_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  phone TEXT NOT NULL,
  vehicle_type public.courier_vehicle_type NOT NULL DEFAULT 'ON_FOOT',
  plate_number TEXT,
  -- Zones are the load-bearing geography entity elsewhere (pricing,
  -- delivery_zones_geography.sql) — reused here rather than the still-
  -- unconsumed delivery_districts table.
  service_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  status public.courier_profile_status NOT NULL DEFAULT 'ACTIVE',
  hired_at DATE,
  admin_comment TEXT,
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courier_profiles_status ON public.courier_profiles(status);
CREATE INDEX idx_courier_profiles_service_zone ON public.courier_profiles(service_zone_id);

GRANT SELECT ON public.courier_profiles TO authenticated;
GRANT ALL ON public.courier_profiles TO service_role;
ALTER TABLE public.courier_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_courier_profiles_updated BEFORE UPDATE ON public.courier_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "courier_profiles_select_admin" ON public.courier_profiles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
-- No authenticated INSERT/UPDATE/DELETE policy: admin manages this table
-- entirely through service_role — no self-service courier profile editing
-- (that stays a separate, untouched flow: courier_status via the courier PWA).

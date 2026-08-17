-- SupabaseAddressRepository set-as-default was two non-atomic statements:
-- clear is_default on every other address for the user, then a separate
-- UPDATE (or INSERT) setting is_default=true on the target row. Two
-- concurrent "set as default" requests (double-tap, retried request, two
-- open tabs) could interleave as: A clears all -> B clears all except B ->
-- A sets A=true -> B sets B=true, leaving two rows both is_default=true for
-- the same user. A single function call is one transaction: the clear and
-- the set happen atomically, and Postgres serializes any two concurrent
-- calls for the same user via row-level lock contention (each call's
-- "clear every other row" necessarily locks the other call's target row).
CREATE OR REPLACE FUNCTION public.set_default_address(p_user_id uuid, p_address_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.addresses
  SET is_default = false
  WHERE user_id = p_user_id AND id <> p_address_id AND is_default = true;

  UPDATE public.addresses
  SET is_default = true
  WHERE id = p_address_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_default_address(uuid, uuid) TO service_role;

-- Defense-in-depth: even if a future code path updates is_default outside
-- this function, the database itself now refuses to hold two default
-- addresses for the same user.
CREATE UNIQUE INDEX addresses_one_default_per_user
  ON public.addresses (user_id)
  WHERE is_default;

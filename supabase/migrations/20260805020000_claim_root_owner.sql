-- Bootstrap Architecture v2.0 — Этап 2, atomic Root Owner claim.
-- See docs/architecture/BOOTSTRAP_EXECUTION_FLOW_ARCHITECTURE.md §11 (transactionality):
-- the "count ROOT_OWNER rows = 0, then insert" check must be one atomic operation, or two
-- concurrent claim attempts could both pass the check before either commits — the same
-- TOCTOU class already fixed elsewhere in this schema (reserve_product_stock,
-- set_default_address, upsert_cart_items). No new table and no change to platform_ownership's
-- structure — this migration only adds a function.
--
-- LOCK TABLE ... IN EXCLUSIVE MODE serializes concurrent claim attempts for the duration of
-- this single function call (itself one implicit transaction via a single RPC invocation).
-- A table-level lock is an acceptable, simple choice here specifically because claiming
-- succeeds at most once in the platform's entire lifetime — this is not a hot path.
CREATE OR REPLACE FUNCTION public.claim_root_owner(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  affected int;
BEGIN
  LOCK TABLE public.platform_ownership IN EXCLUSIVE MODE;

  INSERT INTO public.platform_ownership (user_id, role)
  SELECT p_user_id, 'ROOT_OWNER'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.platform_ownership WHERE role = 'ROOT_OWNER'
  );

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'BOOTSTRAP_ALREADY_COMPLETED';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_root_owner(uuid) TO service_role;

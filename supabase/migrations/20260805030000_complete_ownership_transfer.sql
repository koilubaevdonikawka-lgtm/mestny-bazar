-- Bootstrap Architecture v2.0 — Ownership Transfer completion (docs/architecture/
-- PLATFORM_OWNERSHIP_ARCHITECTURE.md §7, §12). Accept (PENDING -> ACCEPTED) and Cancel
-- (PENDING -> CANCELLED) are each a single conditional UPDATE on ownership_transfers alone,
-- already atomic without a function. Completion is different: it spans two tables
-- (marks the transfer COMPLETED *and* mutates platform_ownership — the target becomes
-- ROOT_OWNER, and the initiator loses that status too if full_handover) — the same
-- TOCTOU class already fixed by claim_root_owner() in Stage 2 and reserve_product_stock/
-- set_default_address/upsert_cart_items before it. No new table, no change to either
-- table's structure — this migration only adds a function.
CREATE OR REPLACE FUNCTION public.complete_ownership_transfer(p_transfer_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_initiator uuid;
  v_target uuid;
  v_full_handover boolean;
  affected int;
BEGIN
  LOCK TABLE public.platform_ownership IN EXCLUSIVE MODE;

  UPDATE public.ownership_transfers
  SET status = 'COMPLETED', completed_at = now()
  WHERE id = p_transfer_id AND status = 'ACCEPTED'
  RETURNING initiator_user_id, target_user_id, full_handover
    INTO v_initiator, v_target, v_full_handover;

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RAISE EXCEPTION 'TRANSFER_NOT_ACCEPTED';
  END IF;

  -- Target becomes (or already is) ROOT_OWNER first — this ordering guarantees at
  -- least one ROOT_OWNER exists at every intermediate point of this transaction,
  -- even before the initiator's row is conditionally removed below.
  INSERT INTO public.platform_ownership (user_id, role)
  VALUES (v_target, 'ROOT_OWNER')
  ON CONFLICT (user_id) DO UPDATE SET role = 'ROOT_OWNER', updated_at = now();

  IF v_full_handover THEN
    DELETE FROM public.platform_ownership WHERE user_id = v_initiator;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_ownership_transfer(uuid) TO service_role;

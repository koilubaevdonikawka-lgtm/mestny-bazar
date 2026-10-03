-- Self-service account deletion (App Store 5.1.1(v), Google Play account deletion
-- policy). Two functions, both callable by service_role only (the server's
-- AccountDeletionService, server/adapters/supabase/account-deletion.repository.ts):
--
-- get_account_deletion_context(user) — every fact the deletion policy needs, in
--   one read (server/domain/account-deletion-policy).
-- erase_customer_account_data(user) — ONE transaction: re-checks the same
--   blockers (a role granted or an order placed after the policy check can't slip
--   through), then detaches + anonymizes the user's orders and deletes the rest of
--   their personal rows. Returns 'STAFF_ACCOUNT' / 'ACTIVE_ORDERS' without
--   changing anything when blocked, 'ERASED' otherwise. Idempotent.
--
-- The auth user itself is deleted afterwards via the Supabase Admin API; that
-- cascades profiles, user_roles and the login identities (Google, Telegram). It
-- has to come last: orders.user_id is ON DELETE RESTRICT, so the auth delete only
-- succeeds once this erase has detached the orders.
--
-- SECURITY INVOKER (same as claim_root_owner): service_role already bypasses RLS,
-- and EXECUTE is revoked from PUBLIC/anon/authenticated so no client JWT can call
-- either function — even if one could, RLS would scope it to the caller's rows.

CREATE OR REPLACE FUNCTION public.get_account_deletion_context(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'ownershipRole', (SELECT po.role::text FROM public.platform_ownership po WHERE po.user_id = p_user_id),
    'accessRoles', COALESCE(
      (SELECT jsonb_agg(ur.role::text ORDER BY ur.role::text) FROM public.user_roles ur WHERE ur.user_id = p_user_id),
      '[]'::jsonb
    ),
    'rbacRoleCount', (SELECT count(*) FROM public.rbac_user_roles rur WHERE rur.user_id = p_user_id),
    'adminScopeCount', (SELECT count(*) FROM public.admin_scopes s WHERE s.user_id = p_user_id),
    -- Still referenced as staff by operational records. Several of these columns
    -- reference auth.users without ON DELETE (assigned_courier_id,
    -- cash_collected_by, sent_by, updated_by, created_by, assigned_by) or with
    -- RESTRICT (seller_payouts), so deleting such a user would fail or rewrite
    -- history — these accounts go through an administrator.
    'hasStaffFootprint', (
         EXISTS (SELECT 1 FROM public.seller_profiles WHERE user_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.courier_profiles WHERE user_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.courier_status WHERE courier_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.seller_payouts WHERE seller_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.products WHERE seller_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.orders WHERE assigned_courier_id = p_user_id)
      OR EXISTS (SELECT 1 FROM public.orders WHERE cash_collected_by = p_user_id)
      OR EXISTS (SELECT 1 FROM public.push_broadcasts WHERE sent_by = p_user_id)
      OR EXISTS (SELECT 1 FROM public.platform_settings WHERE updated_by = p_user_id)
      OR EXISTS (SELECT 1 FROM public.courier_profiles WHERE created_by = p_user_id)
      OR EXISTS (SELECT 1 FROM public.rbac_user_roles WHERE assigned_by = p_user_id)
      OR EXISTS (
        SELECT 1 FROM public.ownership_transfers
        WHERE initiator_user_id = p_user_id OR target_user_id = p_user_id
      )
    ),
    -- Terminal order states are DELIVERED and CANCELLED (TerminalStateGuardRule).
    'activeOrderCount', (
      SELECT count(*) FROM public.orders o
      WHERE o.user_id = p_user_id AND o.status NOT IN ('delivered', 'cancelled')
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.erase_customer_account_data(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_ctx jsonb;
BEGIN
  -- Serialize against a concurrent deletion of the same account and against
  -- status changes of this user's orders while the blockers are evaluated.
  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  PERFORM 1 FROM public.orders WHERE user_id = p_user_id FOR UPDATE;

  v_ctx := public.get_account_deletion_context(p_user_id);

  IF v_ctx->>'ownershipRole' IS NOT NULL
     OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(v_ctx->'accessRoles') AS r(role) WHERE r.role <> 'customer')
     OR (v_ctx->>'rbacRoleCount')::int > 0
     OR (v_ctx->>'adminScopeCount')::int > 0
     OR (v_ctx->>'hasStaffFootprint')::boolean THEN
    RETURN 'STAFF_ACCOUNT';
  END IF;

  IF (v_ctx->>'activeOrderCount')::int > 0 THEN
    RETURN 'ACTIVE_ORDERS';
  END IF;

  -- Orders stay for accounting (amounts, items, statuses, payments untouched) but
  -- become exactly like a guest order (user_id NULL) with the contact snapshot
  -- masked. customer_phone/address_snapshot are NOT NULL, so they become ''
  -- (GuestCustomerService already skips empty phones when listing guests).
  UPDATE public.orders
  SET user_id = NULL,
      customer_name = 'Удалённый пользователь',
      customer_phone = '',
      address_snapshot = '',
      notes = NULL,
      delivery_latitude = NULL,
      delivery_longitude = NULL
  WHERE user_id = p_user_id;

  DELETE FROM public.addresses WHERE user_id = p_user_id;
  DELETE FROM public.carts WHERE user_id = p_user_id; -- cart_items: ON DELETE CASCADE
  DELETE FROM public.device_tokens WHERE user_id = p_user_id;

  -- The profiles row itself goes with the auth user (ON DELETE CASCADE); until
  -- then it must stay a valid row, just without personal data.
  UPDATE public.profiles SET full_name = NULL, phone = NULL WHERE id = p_user_id;

  RETURN 'ERASED';
END;
$$;

REVOKE ALL ON FUNCTION public.get_account_deletion_context(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.erase_customer_account_data(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_context(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.erase_customer_account_data(uuid) TO service_role;

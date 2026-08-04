-- Bootstrap Architecture v2.0 — Platform Ownership domain (Этап 1, фундамент данных).
-- See docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md, BOOTSTRAP_DATA_MODEL_ARCHITECTURE.md,
-- STAGE1_TECHNICAL_DECISIONS.md. Platform Ownership is deliberately NOT stored in user_roles/
-- app_role: it answers "who owns the platform" (Root Owner / Owner), a separate axis from
-- Access-level roles (admin, seller, ...) checked by PermissionPolicyService. Ownership does
-- not go through the Rule Engine and must never be conflated with the app_role enum.
--
-- Bootstrap State (ELIGIBLE / CLAIMING / COMPLETED) is intentionally NOT a stored column or
-- table here — it is a computed value derived from the presence/absence of ROOT_OWNER rows
-- below (STAGE1_TECHNICAL_DECISIONS.md, Вопрос 3).

CREATE TYPE public.platform_ownership_role AS ENUM ('ROOT_OWNER', 'OWNER');

CREATE TABLE public.platform_ownership (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.platform_ownership_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_ownership TO authenticated;
GRANT ALL ON public.platform_ownership TO service_role;
ALTER TABLE public.platform_ownership ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_platform_ownership_updated BEFORE UPDATE ON public.platform_ownership
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Read-only for clients (own record + admin oversight) — every write (Bootstrap claim,
-- Transfer Root Ownership) is a server-side domain operation, never a direct client write,
-- consistent with the existing admin_scopes table (same sensitivity class).
CREATE POLICY "platform_ownership_select_own" ON public.platform_ownership
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "platform_ownership_select_admin" ON public.platform_ownership
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Ownership Transfer — a stateful business process (PENDING → ACCEPTED → COMPLETED /
-- PENDING → CANCELLED), not a single-row mutation. See PLATFORM_OWNERSHIP_ARCHITECTURE.md §7,
-- §12. full_handover distinguishes "co-ownership" (initiator keeps ROOT_OWNER) from "full
-- handover" (initiator relinquishes it as part of the same completed transfer).
CREATE TYPE public.ownership_transfer_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

CREATE TABLE public.ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.ownership_transfer_status NOT NULL DEFAULT 'PENDING',
  full_handover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT ownership_transfers_initiator_not_target CHECK (initiator_user_id <> target_user_id)
);

-- At most one PENDING transfer per target — prevents two simultaneous, conflicting offers
-- of ownership to the same account (BOOTSTRAP_DATA_MODEL_ARCHITECTURE.md §8).
CREATE UNIQUE INDEX ownership_transfers_pending_target_unique
  ON public.ownership_transfers (target_user_id) WHERE status = 'PENDING';

CREATE INDEX idx_ownership_transfers_initiator ON public.ownership_transfers (initiator_user_id);
CREATE INDEX idx_ownership_transfers_target ON public.ownership_transfers (target_user_id);

GRANT SELECT ON public.ownership_transfers TO authenticated;
GRANT ALL ON public.ownership_transfers TO service_role;
ALTER TABLE public.ownership_transfers ENABLE ROW LEVEL SECURITY;

-- Read-only for clients, same reasoning as platform_ownership above — the state machine
-- (Этап 4) writes exclusively through the server-side domain service.
CREATE POLICY "ownership_transfers_select_participant" ON public.ownership_transfers
  FOR SELECT TO authenticated USING (auth.uid() = initiator_user_id OR auth.uid() = target_user_id);
CREATE POLICY "ownership_transfers_select_admin" ON public.ownership_transfers
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

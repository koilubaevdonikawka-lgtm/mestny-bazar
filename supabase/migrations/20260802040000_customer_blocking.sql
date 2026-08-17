-- users.md: blocking a customer — the reserved GLOBAL_GUARD range (order 0-70) in
-- PaymentPolicyService's rule chain, already referenced in server/di/container.ts's own
-- comment ("future global guards (Maintenance, BlockedUser, Corporate, …)"), gets its
-- first real rule (BlockedUserRule).
ALTER TABLE public.profiles ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT false;

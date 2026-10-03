/**
 * Why a self-service account deletion was refused:
 * - STAFF_ACCOUNT — the caller is (or was) platform staff: Root Owner/Owner, any
 *   non-customer access role, RBAC role, admin scope, or still referenced as a
 *   courier/seller/author in operational records. Staff accounts are removed by
 *   a platform administrator, never by the account holder.
 * - ACTIVE_ORDERS — the caller still has an order that is neither delivered nor
 *   cancelled; it has to finish (or be cancelled) first.
 */
export type AccountDeletionBlockReason = "STAFF_ACCOUNT" | "ACTIVE_ORDERS";

export type DeleteMyAccountResult =
  { status: "deleted" } | { status: "blocked"; reason: AccountDeletionBlockReason };

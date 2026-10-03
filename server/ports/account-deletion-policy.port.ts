import type { UserRole } from "@shared/contracts/user";
import type { AccountDeletionBlockReason } from "@shared/contracts/account-deletion";

/**
 * Everything the account-deletion policy needs to know about one user, read in
 * a single query (IAccountDeletionRepository.getDeletionContext). The same
 * conditions are re-checked inside the atomic erase RPC, so a role granted or an
 * order placed between this read and the erase can never slip through.
 */
export interface AccountDeletionContext {
  ownershipRole: "ROOT_OWNER" | "OWNER" | null;
  /** user_roles — every account holds "customer"; anything else is staff. */
  accessRoles: UserRole[];
  /** rbac_user_roles rows — every RBAC role is an administration role. */
  rbacRoleCount: number;
  adminScopeCount: number;
  /**
   * Still referenced as staff by operational data: seller/courier profile,
   * courier status, seller payouts/products, orders assigned to or cash collected
   * by them, push broadcasts/settings/courier profiles/RBAC grants they authored,
   * ownership transfers. Those references would block (or silently rewrite)
   * history if the auth user disappeared, so such accounts go through an admin.
   */
  hasStaffFootprint: boolean;
  /** Orders owned by the user whose status is neither DELIVERED nor CANCELLED. */
  activeOrderCount: number;
}

export type AccountDeletionDenialCode = AccountDeletionBlockReason | "NO_MATCHING_RULE";

export interface AccountDeletionPolicyResult {
  allowed: boolean;
  denialCode?: AccountDeletionDenialCode;
  message?: string;
}

export interface IAccountDeletionPolicy {
  can(context: AccountDeletionContext): AccountDeletionPolicyResult;
}

import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
} from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";
import { AccountDeletionPolicyOrder } from "@server/domain/account-deletion-policy/account-deletion-policy-order";

/** Any role beyond "customer" (admin, warehouse, courier, seller), any RBAC role or admin scope = staff. */
export class StaffRoleGuardRule implements AccountDeletionPolicyRule {
  readonly order = AccountDeletionPolicyOrder.STAFF_ROLE_GUARD;
  readonly terminal = false;

  applies(): boolean {
    return true;
  }

  evaluate(context: AccountDeletionContext): AccountDeletionPolicyResult {
    const hasStaffRole =
      context.accessRoles.some((role) => role !== "customer") ||
      context.rbacRoleCount > 0 ||
      context.adminScopeCount > 0;

    if (hasStaffRole) {
      return {
        allowed: false,
        denialCode: "STAFF_ACCOUNT",
        message: "Staff accounts are deleted by a platform administrator",
      };
    }
    return { allowed: true };
  }
}

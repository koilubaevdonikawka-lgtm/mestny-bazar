import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
} from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";
import { AccountDeletionPolicyOrder } from "@server/domain/account-deletion-policy/account-deletion-policy-order";

/** A former courier/seller/admin still referenced by operational records goes through an administrator too. */
export class StaffFootprintGuardRule implements AccountDeletionPolicyRule {
  readonly order = AccountDeletionPolicyOrder.STAFF_FOOTPRINT_GUARD;
  readonly terminal = false;

  applies(): boolean {
    return true;
  }

  evaluate(context: AccountDeletionContext): AccountDeletionPolicyResult {
    if (context.hasStaffFootprint) {
      return {
        allowed: false,
        denialCode: "STAFF_ACCOUNT",
        message:
          "Account is referenced by staff records and is deleted by a platform administrator",
      };
    }
    return { allowed: true };
  }
}

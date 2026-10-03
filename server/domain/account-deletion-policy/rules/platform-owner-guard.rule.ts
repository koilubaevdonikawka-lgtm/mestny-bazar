import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
} from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";
import { AccountDeletionPolicyOrder } from "@server/domain/account-deletion-policy/account-deletion-policy-order";

/** Root Owner / Owner can never delete themselves — the platform would be left without an owner. */
export class PlatformOwnerGuardRule implements AccountDeletionPolicyRule {
  readonly order = AccountDeletionPolicyOrder.PLATFORM_OWNER_GUARD;
  readonly terminal = false;

  applies(): boolean {
    return true;
  }

  evaluate(context: AccountDeletionContext): AccountDeletionPolicyResult {
    if (context.ownershipRole !== null) {
      return {
        allowed: false,
        denialCode: "STAFF_ACCOUNT",
        message: "Platform owners cannot delete their own account",
      };
    }
    return { allowed: true };
  }
}

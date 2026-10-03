import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
} from "@server/ports/account-deletion-policy.port";

export interface AccountDeletionPolicyRule {
  readonly order: number;
  readonly terminal?: boolean;
  applies(context: AccountDeletionContext): boolean;
  evaluate(context: AccountDeletionContext): AccountDeletionPolicyResult;
}

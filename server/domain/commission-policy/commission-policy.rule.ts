import type {
  CommissionPolicyContext,
  CommissionPolicyResult,
} from "@server/ports/commission-policy.port";

export interface CommissionPolicyRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /** When false, a result continues the chain. Defaults to true. */
  readonly terminal?: boolean;
  applies(context: CommissionPolicyContext): boolean;
  evaluate(context: CommissionPolicyContext): CommissionPolicyResult;
}

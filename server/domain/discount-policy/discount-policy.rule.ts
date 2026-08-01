import type {
  DiscountPolicyContext,
  DiscountPolicyResult,
} from "@server/ports/discount-policy.port";

export interface DiscountPolicyRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /** When false, an allowed result continues the chain. Defaults to true. */
  readonly terminal?: boolean;
  applies(context: DiscountPolicyContext): boolean;
  evaluate(context: DiscountPolicyContext): DiscountPolicyResult;
}

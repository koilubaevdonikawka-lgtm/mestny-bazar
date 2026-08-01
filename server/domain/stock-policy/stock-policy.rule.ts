import type { StockPolicyContext, StockPolicyResult } from "@server/ports/stock-policy.port";

export interface StockPolicyRule {
  readonly order: number;
  readonly terminal?: boolean;
  applies(context: StockPolicyContext): boolean;
  evaluate(context: StockPolicyContext): StockPolicyResult;
}

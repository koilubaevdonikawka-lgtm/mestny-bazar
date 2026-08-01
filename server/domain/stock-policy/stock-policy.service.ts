import type {
  IStockPolicy,
  StockPolicyContext,
  StockPolicyResult,
} from "@server/ports/stock-policy.port";
import type { StockPolicyRule } from "@server/domain/stock-policy/stock-policy.rule";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@server/domain/stock-policy/stock-policy-order";
import { StockPolicyDeniedError } from "@server/domain/stock-policy/stock-policy.errors";

function sortRulesByOrder(rules: StockPolicyRule[]): StockPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/** Rule Engine standard (docs/principles/12-rule-engine-standard.md) applied to stock-level evaluation. */
export class StockPolicyService implements IStockPolicy {
  private readonly rules: StockPolicyRule[];

  constructor(rules: StockPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  evaluateStock(context: StockPolicyContext): StockPolicyResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "NO_MATCHING_RULE",
      message: "No stock policy rule matched",
      effectiveThreshold: context.threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
    };
  }

  assertStockOk(context: StockPolicyContext): void {
    const result = this.evaluateStock(context);
    if (result.allowed) return;

    throw new StockPolicyDeniedError(
      result.denialCode ?? "STOCK_POLICY_DENIED",
      result.message ?? "Stock level is not acceptable",
    );
  }
}

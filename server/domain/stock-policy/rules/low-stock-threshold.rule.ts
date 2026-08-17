import type { StockPolicyContext, StockPolicyResult } from "@server/ports/stock-policy.port";
import type { StockPolicyRule } from "@server/domain/stock-policy/stock-policy.rule";
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  StockPolicyOrder,
} from "@server/domain/stock-policy/stock-policy-order";

/** Flags a product as low/depleted against its threshold (per-product override, or the platform default). */
export class LowStockThresholdRule implements StockPolicyRule {
  readonly order = StockPolicyOrder.LOW_STOCK_THRESHOLD;

  applies(_context: StockPolicyContext): boolean {
    return true;
  }

  evaluate(context: StockPolicyContext): StockPolicyResult {
    const effectiveThreshold = context.threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

    if (context.stock <= 0) {
      return {
        allowed: false,
        denialCode: "DEPLETED",
        message: "Product is out of stock",
        effectiveThreshold,
      };
    }

    if (context.stock <= effectiveThreshold) {
      return {
        allowed: false,
        denialCode: "LOW_STOCK",
        message: "Stock is at or below the low-stock threshold",
        effectiveThreshold,
      };
    }

    return { allowed: true, effectiveThreshold };
  }
}

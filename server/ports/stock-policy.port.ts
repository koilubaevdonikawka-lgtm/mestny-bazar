export type StockPolicyDenialCode = "LOW_STOCK" | "DEPLETED" | "NO_MATCHING_RULE";

export interface StockPolicyContext {
  productId: string;
  categoryId: string | null;
  stock: number;
  /** Per-product override; null means the rule falls back to its own default. */
  threshold: number | null;
}

export interface StockPolicyResult {
  /** true = stock level is healthy (at/above the effective threshold). */
  allowed: boolean;
  denialCode?: StockPolicyDenialCode;
  message?: string;
  effectiveThreshold: number;
}

export interface IStockPolicy {
  evaluateStock(context: StockPolicyContext): StockPolicyResult;
  assertStockOk(context: StockPolicyContext): void;
}

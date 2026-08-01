export const StockPolicyOrder = {
  LOW_STOCK_THRESHOLD: 10,
} as const;

/** Applied when a product has no per-product threshold override (warehouse.md). */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

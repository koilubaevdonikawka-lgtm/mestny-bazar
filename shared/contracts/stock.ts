export type StockStatus = "ok" | "low" | "depleted";

export interface StockItemDTO {
  productId: string;
  name: string;
  stock: number;
  /** Per-product override; null means the default threshold applies (see StockPolicyService). */
  lowStockThreshold: number | null;
  /** Resolved threshold actually used to compute status (override or default). */
  effectiveThreshold: number;
  status: StockStatus;
}

export interface AdjustStockRequest {
  productId: string;
  /** Absolute new stock count (inventory correction), not a delta. */
  stock: number;
}

export interface SetStockThresholdRequest {
  productId: string;
  /** null clears the override, reverting to the default threshold. */
  threshold: number | null;
}

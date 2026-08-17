import type { StockStatus } from "@shared/contracts/stock";

/**
 * Independent stock accounting for a product variant (Stage 14). Reuses
 * StockStatus (stock.ts, Stage warehouse.md) rather than a parallel type —
 * status is computed by the same StockPolicyService the product-level
 * warehouse already uses. Tracking is opt-in per variant (no row until
 * InitializeVariantStockRequest is called) — no reservation, movement, or
 * checkout integration exists yet.
 */
export interface VariantStockDTO {
  variantId: string;
  stock: number;
  lowStockThreshold: number | null;
  effectiveThreshold: number;
  status: StockStatus;
}

export interface InitializeVariantStockRequest {
  variantId: string;
  stock?: number;
  lowStockThreshold?: number | null;
}

export interface AdjustVariantStockRequest {
  variantId: string;
  stock: number;
}

export interface SetVariantStockThresholdRequest {
  variantId: string;
  threshold: number | null;
}

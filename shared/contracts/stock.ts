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
  /** Уже существующее поле товара (products.unit) — контекст при вводе количества в формах движения товара. */
  unit: string | null;
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

/**
 * Движение товара — Поступление/Возврат (Промпт №4). Both increase stock
 * through the same existing InventoryService.increaseStock() Suppliers
 * already uses; unit is read from the product itself (already modeled),
 * not collected again here.
 */
export interface RecordStockReceiptRequest {
  productId: string;
  quantity: number;
  /** Operational date entered by the warehouse user — distinct from the audit log's own recorded-at timestamp. */
  movementDate: string;
  /** Existing purchase-price concept (supply_items.purchase_price) — optional, receipts aren't always tied to a formal supply. */
  purchasePrice?: number | null;
  /** References an existing supplier (suppliers.md) — optional, not every receipt has one. */
  supplierId?: string | null;
}

export interface RecordStockReturnRequest {
  productId: string;
  quantity: number;
  movementDate: string;
  note?: string | null;
}

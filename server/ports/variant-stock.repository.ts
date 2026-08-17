/** Raw row shape — status/effectiveThreshold are computed in the domain service via IStockPolicy, mirroring StockRow/IStockRepository. */
export interface VariantStockRow {
  variantId: string;
  stock: number;
  lowStockThreshold: number | null;
}

/** Mirrors StockReservationItem (product.repository.ts) exactly, scoped to a variant instead of a product. */
export interface VariantStockReservationItem {
  variantId: string;
  quantity: number;
}

/** Sibling of IStockRepository, scoped to product_variant_stock instead of products. Deliberately a separate port so the existing warehouse port/table stays untouched. */
export interface IVariantStockRepository {
  listForProduct(productId: string): Promise<VariantStockRow[]>;
  getByVariantId(variantId: string): Promise<VariantStockRow | null>;
  /** Fails if a row already exists for this variantId (tracking is opt-in, once). */
  create(
    variantId: string,
    stock: number,
    lowStockThreshold: number | null,
  ): Promise<VariantStockRow>;
  adjustStock(variantId: string, stock: number): Promise<VariantStockRow>;
  setLowStockThreshold(variantId: string, threshold: number | null): Promise<VariantStockRow>;
  /**
   * Stage 19 — mirrors IProductRepository.reserveStock exactly: atomic,
   * all-or-nothing decrement via RPC. A variantId with no tracked stock row
   * (opt-in tracking, Stage 14) is skipped rather than rejected — consistent
   * with CheckoutService's existing read-only stock check (Stage 18), which
   * already treats an untracked variant as having no stock constraint.
   */
  reserveStock(items: VariantStockReservationItem[]): Promise<void>;
  /** Mirrors IProductRepository.releaseStock exactly: additive, no floor check. */
  releaseStock(items: VariantStockReservationItem[]): Promise<void>;
}

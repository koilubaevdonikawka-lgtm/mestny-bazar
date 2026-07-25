import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";

export interface StockReservationItem {
  productId: string;
  quantity: number;
}

export interface IProductRepository {
  list(params: ProductListParams): Promise<ProductListResult>;
  getBySlug(slug: string): Promise<ProductDTO | null>;
  getById(id: string): Promise<ProductDTO | null>;
  checkStock(productId: string, quantity: number): Promise<boolean>;
  /** Atomically checks and decrements stock for every item, or none at all. */
  reserveStock(items: StockReservationItem[]): Promise<void>;
  /** Best-effort compensation for a reservation that must be undone. */
  releaseStock(items: StockReservationItem[]): Promise<void>;
}

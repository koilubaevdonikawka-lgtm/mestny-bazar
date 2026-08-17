export interface StockRow {
  productId: string;
  name: string;
  stock: number;
  lowStockThreshold: number | null;
  categoryId: string | null;
  /** Уже существующее поле товара (products.unit) — для отображения рядом с количеством в формах движения товара. */
  unit: string | null;
}

export interface IStockRepository {
  /** All products regardless of publication status — warehouse manages stock for the whole catalog. */
  list(): Promise<StockRow[]>;
  getById(productId: string): Promise<StockRow | null>;
  /** Sets an absolute stock count (inventory correction), not a delta. */
  adjustStock(productId: string, stock: number): Promise<StockRow>;
  setLowStockThreshold(productId: string, threshold: number | null): Promise<StockRow>;
}

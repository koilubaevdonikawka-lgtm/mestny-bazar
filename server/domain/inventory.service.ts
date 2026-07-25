import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";

export class InventoryService {
  constructor(private readonly products: IProductRepository) {}

  /** Atomically checks and decrements stock for every item, or reserves none at all. */
  async reserveStock(items: StockReservationItem[]): Promise<void> {
    await this.products.reserveStock(items);
  }

  /** Compensates a reservation that must be undone (e.g. order creation failed after it). */
  async releaseStock(items: StockReservationItem[]): Promise<void> {
    await this.products.releaseStock(items);
  }
}

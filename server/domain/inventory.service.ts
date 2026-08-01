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

  /** New stock physically received from a supplier (suppliers.md) — the single entry point Suppliers uses to write to Warehouse's stock. */
  async increaseStock(items: StockReservationItem[]): Promise<void> {
    await this.products.increaseStock(items);
  }
}

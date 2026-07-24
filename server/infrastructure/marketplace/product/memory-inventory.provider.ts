import type { IInventoryProvider } from "@server/application/modules/product/product/contracts";

/** In-memory inventory provider for development and tests. */
export class MemoryInventoryProvider implements IInventoryProvider {
  private readonly stockByProductId = new Map<string, number>();

  async getAvailableStock(productId: string): Promise<number | null> {
    if (!this.stockByProductId.has(productId)) {
      return null;
    }
    return this.stockByProductId.get(productId) ?? 0;
  }

  async setStock(productId: string, quantity: number): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Stock quantity must be a non-negative integer.");
    }
    this.stockByProductId.set(productId, quantity);
  }
}

import type { IProductRepository } from "@server/ports/product.repository";

export class InventoryService {
  constructor(private readonly products: IProductRepository) {}

  async validateStock(items: Array<{ productId: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      const available = await this.products.checkStock(item.productId, item.quantity);
      if (!available) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }
  }
}

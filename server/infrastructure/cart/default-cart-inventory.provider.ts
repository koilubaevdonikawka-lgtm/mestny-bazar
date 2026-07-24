import type { ICatalogCartReader } from "@server/application/cart-management/contracts/catalog-cart-reader.contract";
import type { ICartInventoryProvider } from "@server/application/cart-management/contracts/cart-inventory-provider.contract";

/** Catalog-backed inventory checks until Inventory BCM is connected. */
export class DefaultCartInventoryProvider implements ICartInventoryProvider {
  constructor(private readonly catalogReader: ICatalogCartReader) {}

  async getAvailableStock(productId: string): Promise<number> {
    const availability = await this.catalogReader.checkAvailability(productId);
    if (!availability?.published || !availability.available) {
      return 0;
    }
    return availability.stockQuantity;
  }

  async canFulfill(productId: string, quantity: number): Promise<boolean> {
    const stock = await this.getAvailableStock(productId);
    return stock >= quantity;
  }
}

import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type {
  CatalogProductAvailability,
  CatalogProductCard,
  CatalogProductDetails,
} from "@server/application/catalog-management/models/catalog-product.model";
import type { ICatalogCheckoutReader } from "@server/application/checkout-management/contracts/catalog-checkout-reader.contract";

/** Adapts Catalog Management to ICatalogCheckoutReader — no Product BCM access. */
export class CatalogCheckoutReaderAdapter implements ICatalogCheckoutReader {
  constructor(private readonly catalog: CatalogManagementApplicationService) {}

  async getProduct(productId: string): Promise<CatalogProductDetails | null> {
    const result = await this.catalog.getProductDetails(productId);
    return result.value;
  }

  async getProducts(productIds: readonly string[]): Promise<readonly CatalogProductCard[]> {
    const uniqueIds = [...new Set(productIds.map((id) => id.trim()).filter(Boolean))];
    const products: CatalogProductCard[] = [];

    for (const productId of uniqueIds) {
      const result = await this.catalog.getProductDetails(productId);
      if (result.value) {
        products.push(result.value);
      }
    }

    return Object.freeze(products);
  }

  async checkAvailability(productId: string): Promise<CatalogProductAvailability | null> {
    const result = await this.catalog.checkAvailability(productId);
    return result.value;
  }

  async isSellerAvailable(sellerId: string): Promise<boolean> {
    const result = await this.catalog.getProductsBySeller(sellerId, { limit: 1, offset: 0 });
    return result.value.items.length > 0;
  }
}

import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type {
  CatalogProductAvailability,
  CatalogProductCard,
  CatalogProductDetails,
} from "@server/application/catalog-management/models/catalog-product.model";
import type { ICatalogCartReader } from "@server/application/cart-management/contracts/catalog-cart-reader.contract";

/** Adapts Catalog Management to ICatalogCartReader — no Product BCM access. */
export class CatalogCartReaderAdapter implements ICatalogCartReader {
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
}

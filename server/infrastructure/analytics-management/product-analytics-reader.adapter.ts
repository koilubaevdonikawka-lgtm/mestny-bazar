import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import { MAX_CATALOG_LIMIT } from "@server/application/catalog-management/dto/catalog-query.dto";
import type {
  IProductAnalyticsReader,
  ProductAnalyticsRecord,
  ProductAnalyticsSnapshot,
} from "@server/application/analytics-management/contracts/product-analytics-reader.contract";

/** Adapts Catalog Management to IProductAnalyticsReader — no Product BCM access. */
export class ProductAnalyticsReaderAdapter implements IProductAnalyticsReader {
  constructor(private readonly catalog: CatalogManagementApplicationService) {}

  async getProductSnapshot(): Promise<ProductAnalyticsSnapshot> {
    const result = await this.catalog.listProducts({ limit: MAX_CATALOG_LIMIT, offset: 0 });
    const items = result.value.items;

    const records: ProductAnalyticsRecord[] = items.map((product) =>
      Object.freeze({
        productId: product.id,
        sellerId: product.sellerId,
        productName: product.name,
        price: product.price.amount,
        currency: product.price.currency,
        categoryId: product.categoryId,
        available: product.stockAvailable > 0,
      }),
    );

    const productsBySeller: Record<string, number> = {};
    let availableProducts = 0;

    for (const product of records) {
      productsBySeller[product.sellerId] = (productsBySeller[product.sellerId] ?? 0) + 1;
      if (product.available) {
        availableProducts += 1;
      }
    }

    return Object.freeze({
      totalProducts: result.value.total,
      availableProducts,
      productsBySeller: Object.freeze(productsBySeller),
      records: Object.freeze(records),
    });
  }
}

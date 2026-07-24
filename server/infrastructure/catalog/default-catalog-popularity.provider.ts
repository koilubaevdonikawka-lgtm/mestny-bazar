import type { ICatalogPopularityProvider } from "@server/application/catalog-management/contracts/catalog-popularity-provider.contract";
import type { Product } from "@server/application/modules/product/product/models";

const DEFAULT_LIMIT = 20;

/** Simple popularity heuristic until Analytics BCM / Experience Engine is connected. */
export class DefaultCatalogPopularityProvider implements ICatalogPopularityProvider {
  rankPopular(products: readonly Product[], limit = DEFAULT_LIMIT): readonly Product[] {
    return [...products]
      .sort((left, right) => {
        const stockDiff = right.stock.quantity - left.stock.quantity;
        if (stockDiff !== 0) {
          return stockDiff;
        }
        return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      })
      .slice(0, limit);
  }
}

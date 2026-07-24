import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type { IFullTextSearchProvider } from "@server/application/search-management/contracts/full-text-search-provider.contract";

/** Simple in-memory full-text filter on product name and description. */
export class InMemoryFullTextSearchProvider implements IFullTextSearchProvider {
  filter(products: readonly CatalogProductCard[], query: string): readonly CatalogProductCard[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }

    return products.filter((product) => this.score(product, normalized) > 0);
  }

  score(product: CatalogProductCard, query: string): number {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return 1;
    }

    const name = product.name.toLowerCase();
    const description = (product.description ?? "").toLowerCase();

    if (name === normalized) {
      return 100;
    }
    if (name.startsWith(normalized)) {
      return 80;
    }
    if (name.includes(normalized)) {
      return 60;
    }
    if (description.includes(normalized)) {
      return 40;
    }

    return 0;
  }
}

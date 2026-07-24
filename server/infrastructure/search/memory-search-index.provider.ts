import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type { ICatalogSearchReader } from "@server/application/search-management/contracts/catalog-search-reader.contract";
import type { ISearchIndexProvider } from "@server/application/search-management/contracts/search-index-provider.contract";
import { MAX_SEARCH_SCAN } from "@server/application/search-management/dto/search-query.dto";

/** In-memory search index backed by Catalog Management reader. */
export class MemorySearchIndexProvider implements ISearchIndexProvider {
  private indexedProducts: readonly CatalogProductCard[] = [];

  constructor(private readonly catalogReader: ICatalogSearchReader) {}

  async refresh(): Promise<void> {
    const result = await this.catalogReader.listProducts({
      limit: MAX_SEARCH_SCAN,
      offset: 0,
    });
    this.indexedProducts = Object.freeze([...result.items]);
  }

  async getIndexedProducts(): Promise<readonly CatalogProductCard[]> {
    return this.indexedProducts;
  }
}

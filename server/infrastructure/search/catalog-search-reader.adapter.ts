import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { CatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import type { CatalogProductListResult } from "@server/application/catalog-management/models/catalog-product.model";
import type { ICatalogSearchReader } from "@server/application/search-management/contracts/catalog-search-reader.contract";

/** Adapts Catalog Management to the ICatalogSearchReader port — no Product BCM access. */
export class CatalogSearchReaderAdapter implements ICatalogSearchReader {
  constructor(private readonly catalog: CatalogManagementApplicationService) {}

  async listProducts(query?: CatalogListQuery): Promise<CatalogProductListResult> {
    const result = await this.catalog.listProducts(query);
    return result.value;
  }

  async listByCategory(
    categoryId: string,
    query?: CatalogListQuery,
  ): Promise<CatalogProductListResult> {
    const result = await this.catalog.getProductsByCategory(categoryId, query);
    return result.value;
  }

  async listBySeller(sellerId: string, query?: CatalogListQuery): Promise<CatalogProductListResult> {
    const result = await this.catalog.getProductsBySeller(sellerId, query);
    return result.value;
  }
}

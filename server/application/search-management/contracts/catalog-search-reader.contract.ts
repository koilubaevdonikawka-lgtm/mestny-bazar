import type { CatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import type { CatalogProductListResult } from "@server/application/catalog-management/models/catalog-product.model";

/**
 * Read-only catalog access port for Search Management.
 * Implemented by an adapter over Catalog Management — no Product BCM access.
 */
export interface ICatalogSearchReader {
  listProducts(query?: CatalogListQuery): Promise<CatalogProductListResult>;
  listByCategory(categoryId: string, query?: CatalogListQuery): Promise<CatalogProductListResult>;
  listBySeller(sellerId: string, query?: CatalogListQuery): Promise<CatalogProductListResult>;
}

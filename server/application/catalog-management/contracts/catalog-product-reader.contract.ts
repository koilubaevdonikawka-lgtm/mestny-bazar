import type { Product } from "@server/application/modules/product/product/models";
import type { CatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";

/**
 * Read-only catalog product source.
 * Implemented in infrastructure — Catalog Management never writes through this port.
 */
export interface ICatalogProductReader {
  findPublishedProducts(query?: CatalogListQuery): Promise<readonly Product[]>;
  findPublishedByCategory(
    categoryId: string,
    query?: CatalogListQuery,
  ): Promise<readonly Product[]>;
  findPublishedBySeller(sellerId: string, query?: CatalogListQuery): Promise<readonly Product[]>;
  findPublishedById(productId: string): Promise<Product | null>;
  countPublishedProducts(): Promise<number>;
}

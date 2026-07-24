import type {
  CatalogProductCard,
  CatalogProductDetails,
} from "@server/application/catalog-management/models/catalog-product.model";

/**
 * Read-only catalog access for favorites enrichment.
 * Implemented by an adapter over Catalog Management — no Product BCM access.
 */
export interface ICatalogFavoritesReader {
  getProduct(productId: string): Promise<CatalogProductDetails | null>;
  getProducts(productIds: readonly string[]): Promise<readonly CatalogProductCard[]>;
}

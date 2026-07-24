import type {
  CatalogProductAvailability,
  CatalogProductCard,
  CatalogProductDetails,
} from "@server/application/catalog-management/models/catalog-product.model";

/**
 * Read-only catalog access for cart enrichment and validation.
 * Implemented by an adapter over Catalog Management — no Product BCM access.
 */
export interface ICatalogCartReader {
  getProduct(productId: string): Promise<CatalogProductDetails | null>;
  getProducts(productIds: readonly string[]): Promise<readonly CatalogProductCard[]>;
  checkAvailability(productId: string): Promise<CatalogProductAvailability | null>;
}

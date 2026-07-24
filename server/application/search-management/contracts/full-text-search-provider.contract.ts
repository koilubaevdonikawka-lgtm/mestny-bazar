import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

/** Full-text matching — replace with AI Search / Vector Search later. */
export interface IFullTextSearchProvider {
  filter(products: readonly CatalogProductCard[], query: string): readonly CatalogProductCard[];
  score(product: CatalogProductCard, query: string): number;
}

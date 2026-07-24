import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

/** In-memory search index — replace with Elasticsearch / OpenSearch / Meilisearch later. */
export interface ISearchIndexProvider {
  refresh(): Promise<void>;
  getIndexedProducts(): Promise<readonly CatalogProductCard[]>;
}

import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Future integration point for vector database metadata indexing. Not wired yet. */
export interface IVectorMetadataProvider {
  index(entry: CatalogMetadata): Promise<void>;
  remove(metadataId: string): Promise<void>;
  search(query: string, limit?: number): Promise<readonly CatalogMetadata[]>;
}

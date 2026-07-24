import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

export interface ICatalogMetadataCatalog {
  register(entry: CatalogMetadata): Promise<void>;
  remove(metadataId: string): Promise<void>;
  findById(metadataId: string): Promise<CatalogMetadata | null>;
  findByName(name: string): Promise<CatalogMetadata | null>;
  findByCategory(category: string): Promise<readonly CatalogMetadata[]>;
  listAll(): Promise<readonly CatalogMetadata[]>;
}

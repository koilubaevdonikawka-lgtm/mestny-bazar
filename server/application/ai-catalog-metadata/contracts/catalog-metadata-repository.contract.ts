import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

export interface ICatalogMetadataRepository {
  save(entry: CatalogMetadata): Promise<void>;
  findById(metadataId: string): Promise<CatalogMetadata | null>;
  findByName(name: string): Promise<CatalogMetadata | null>;
  findByCategory(category: string): Promise<readonly CatalogMetadata[]>;
  findAll(): Promise<readonly CatalogMetadata[]>;
  delete(metadataId: string): Promise<boolean>;
}

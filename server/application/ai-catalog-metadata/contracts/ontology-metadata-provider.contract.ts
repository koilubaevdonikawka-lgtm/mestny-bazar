import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Future integration point for ontology engine metadata. Not wired yet. */
export interface IOntologyMetadataProvider {
  register(entry: CatalogMetadata): Promise<void>;
  remove(metadataId: string): Promise<void>;
  resolve(concept: string): Promise<readonly CatalogMetadata[]>;
}

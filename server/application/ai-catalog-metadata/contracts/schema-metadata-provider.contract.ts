import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Future integration point for schema-based metadata providers. Not wired yet. */
export interface ISchemaMetadataProvider {
  validate(entry: CatalogMetadata): Promise<boolean>;
  describe(metadataId: string): Promise<unknown>;
}

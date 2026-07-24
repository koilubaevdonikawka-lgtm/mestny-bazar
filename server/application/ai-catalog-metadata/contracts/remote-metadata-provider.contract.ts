import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Future integration point for external metadata registries. Not wired yet. */
export interface IRemoteMetadataProvider {
  fetchRemote(metadataId: string): Promise<CatalogMetadata | null>;
  pushRemote(entry: CatalogMetadata): Promise<void>;
}

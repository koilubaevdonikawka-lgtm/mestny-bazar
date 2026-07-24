import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Future integration point for automatic metadata synchronization. Not wired yet. */
export interface IMetadataSynchronizationProvider {
  synchronize(entries: readonly CatalogMetadata[]): Promise<{ synced: number }>;
  getLastSyncAt(): Promise<string | null>;
}

import type { CatalogMetadataStatistics } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

export interface ICatalogMetadataStatisticsProvider {
  getStatistics(input: {
    totalEntries: number;
    activeEntries: number;
    categories: readonly string[];
  }): Promise<CatalogMetadataStatistics>;
}

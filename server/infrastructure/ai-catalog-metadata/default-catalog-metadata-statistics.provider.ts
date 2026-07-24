import type { ICatalogMetadataStatisticsProvider } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-statistics-provider.contract";
import type { CatalogMetadataStatistics } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** Default in-memory catalog metadata statistics provider. */
export class DefaultCatalogMetadataStatisticsProvider implements ICatalogMetadataStatisticsProvider {
  async getStatistics(input: {
    totalEntries: number;
    activeEntries: number;
    categories: readonly string[];
  }): Promise<CatalogMetadataStatistics> {
    return Object.freeze({
      totalEntries: input.totalEntries,
      activeEntries: input.activeEntries,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

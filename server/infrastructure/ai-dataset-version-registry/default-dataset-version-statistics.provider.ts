import type { IDatasetVersionStatisticsProvider } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-statistics-provider.contract";
import type { DatasetVersionRegistryStatistics } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Default in-memory dataset version statistics provider. */
export class DefaultDatasetVersionStatisticsProvider implements IDatasetVersionStatisticsProvider {
  async getStatistics(input: {
    totalDatasetVersions: number;
    activeDatasetVersions: number;
    categories: readonly string[];
  }): Promise<DatasetVersionRegistryStatistics> {
    return Object.freeze({
      totalDatasetVersions: input.totalDatasetVersions,
      activeDatasetVersions: input.activeDatasetVersions,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

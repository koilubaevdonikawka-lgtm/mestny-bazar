import type { IDatasetStatisticsProvider } from "@server/application/ai-dataset-registry/contracts/dataset-statistics-provider.contract";
import type { DatasetRegistryStatistics } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Default in-memory dataset statistics provider. */
export class DefaultDatasetStatisticsProvider implements IDatasetStatisticsProvider {
  async getStatistics(input: {
    totalDatasets: number;
    activeDatasets: number;
    categories: readonly string[];
  }): Promise<DatasetRegistryStatistics> {
    return Object.freeze({
      totalDatasets: input.totalDatasets,
      activeDatasets: input.activeDatasets,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

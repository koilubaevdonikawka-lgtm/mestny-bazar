import type { DatasetVersionRegistryStatistics } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

export interface IDatasetVersionStatisticsProvider {
  getStatistics(input: {
    totalDatasetVersions: number;
    activeDatasetVersions: number;
    categories: readonly string[];
  }): Promise<DatasetVersionRegistryStatistics>;
}

import type { DatasetRegistryStatistics } from "@server/application/ai-dataset-registry/models/dataset.model";

export interface IDatasetStatisticsProvider {
  getStatistics(input: {
    totalDatasets: number;
    activeDatasets: number;
    categories: readonly string[];
  }): Promise<DatasetRegistryStatistics>;
}

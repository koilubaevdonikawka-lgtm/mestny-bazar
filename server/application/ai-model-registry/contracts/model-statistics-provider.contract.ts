import type { ModelRegistryStatistics } from "@server/application/ai-model-registry/models/model.model";

export interface IModelStatisticsProvider {
  getStatistics(input: {
    totalModels: number;
    activeModels: number;
    providers: readonly string[];
  }): Promise<ModelRegistryStatistics>;
}

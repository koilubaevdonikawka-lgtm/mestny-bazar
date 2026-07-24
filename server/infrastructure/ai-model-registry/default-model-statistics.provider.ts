import type { IModelStatisticsProvider } from "@server/application/ai-model-registry/contracts/model-statistics-provider.contract";
import type { ModelRegistryStatistics } from "@server/application/ai-model-registry/models/model.model";

/** Default in-memory model statistics provider. */
export class DefaultModelStatisticsProvider implements IModelStatisticsProvider {
  async getStatistics(input: {
    totalModels: number;
    activeModels: number;
    providers: readonly string[];
  }): Promise<ModelRegistryStatistics> {
    return Object.freeze({
      totalModels: input.totalModels,
      activeModels: input.activeModels,
      providerCount: input.providers.length,
      providers: Object.freeze([...input.providers]),
    });
  }
}

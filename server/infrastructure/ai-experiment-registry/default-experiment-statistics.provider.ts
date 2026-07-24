import type { IExperimentStatisticsProvider } from "@server/application/ai-experiment-registry/contracts/experiment-statistics-provider.contract";
import type { ExperimentRegistryStatistics } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Default in-memory experiment statistics provider. */
export class DefaultExperimentStatisticsProvider implements IExperimentStatisticsProvider {
  async getStatistics(input: {
    totalExperiments: number;
    activeExperiments: number;
    categories: readonly string[];
  }): Promise<ExperimentRegistryStatistics> {
    return Object.freeze({
      totalExperiments: input.totalExperiments,
      activeExperiments: input.activeExperiments,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

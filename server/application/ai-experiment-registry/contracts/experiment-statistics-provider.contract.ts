import type { ExperimentRegistryStatistics } from "@server/application/ai-experiment-registry/models/experiment.model";

export interface IExperimentStatisticsProvider {
  getStatistics(input: {
    totalExperiments: number;
    activeExperiments: number;
    categories: readonly string[];
  }): Promise<ExperimentRegistryStatistics>;
}

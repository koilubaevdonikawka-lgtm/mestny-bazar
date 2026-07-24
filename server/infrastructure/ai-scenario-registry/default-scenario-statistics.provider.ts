import type { IScenarioStatisticsProvider } from "@server/application/ai-scenario-registry/contracts/scenario-statistics-provider.contract";
import type { ScenarioRegistryStatistics } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Default in-memory scenario statistics provider. */
export class DefaultScenarioStatisticsProvider implements IScenarioStatisticsProvider {
  async getStatistics(input: {
    totalScenarios: number;
    activeScenarios: number;
    categories: readonly string[];
  }): Promise<ScenarioRegistryStatistics> {
    return Object.freeze({
      totalScenarios: input.totalScenarios,
      activeScenarios: input.activeScenarios,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

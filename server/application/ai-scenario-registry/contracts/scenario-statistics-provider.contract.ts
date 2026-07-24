import type { ScenarioRegistryStatistics } from "@server/application/ai-scenario-registry/models/scenario.model";

export interface IScenarioStatisticsProvider {
  getStatistics(input: {
    totalScenarios: number;
    activeScenarios: number;
    categories: readonly string[];
  }): Promise<ScenarioRegistryStatistics>;
}

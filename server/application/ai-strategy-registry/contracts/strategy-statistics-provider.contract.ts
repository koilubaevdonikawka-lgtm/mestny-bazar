import type { StrategyRegistryStatistics } from "@server/application/ai-strategy-registry/models/strategy.model";

export interface IStrategyStatisticsProvider {
  getStatistics(input: {
    totalStrategies: number;
    activeStrategies: number;
    categories: readonly string[];
  }): Promise<StrategyRegistryStatistics>;
}

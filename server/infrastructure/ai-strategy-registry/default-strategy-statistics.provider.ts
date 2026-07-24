import type { IStrategyStatisticsProvider } from "@server/application/ai-strategy-registry/contracts/strategy-statistics-provider.contract";
import type { StrategyRegistryStatistics } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Default in-memory strategy statistics provider. */
export class DefaultStrategyStatisticsProvider implements IStrategyStatisticsProvider {
  async getStatistics(input: {
    totalStrategies: number;
    activeStrategies: number;
    categories: readonly string[];
  }): Promise<StrategyRegistryStatistics> {
    return Object.freeze({
      totalStrategies: input.totalStrategies,
      activeStrategies: input.activeStrategies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

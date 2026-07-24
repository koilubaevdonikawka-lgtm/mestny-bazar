import type { IRuleStatisticsProvider } from "@server/application/ai-rule-registry/contracts/rule-statistics-provider.contract";
import type { RuleRegistryStatistics } from "@server/application/ai-rule-registry/models/rule.model";

/** Default in-memory rule statistics provider. */
export class DefaultRuleStatisticsProvider implements IRuleStatisticsProvider {
  async getStatistics(input: {
    totalRules: number;
    activeRules: number;
    categories: readonly string[];
  }): Promise<RuleRegistryStatistics> {
    return Object.freeze({
      totalRules: input.totalRules,
      activeRules: input.activeRules,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { ISafetyRuleStatisticsProvider } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-statistics-provider.contract";
import type { SafetyRuleRegistryStatistics } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Default in-memory safety rule statistics provider. */
export class DefaultSafetyRuleStatisticsProvider implements ISafetyRuleStatisticsProvider {
  async getStatistics(input: {
    totalSafetyRules: number;
    activeSafetyRules: number;
    categories: readonly string[];
  }): Promise<SafetyRuleRegistryStatistics> {
    return Object.freeze({
      totalSafetyRules: input.totalSafetyRules,
      activeSafetyRules: input.activeSafetyRules,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

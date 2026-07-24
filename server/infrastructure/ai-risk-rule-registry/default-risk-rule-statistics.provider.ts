import type { IRiskRuleStatisticsProvider } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-statistics-provider.contract";
import type { RiskRuleRegistryStatistics } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Default in-memory risk rule statistics provider. */
export class DefaultRiskRuleStatisticsProvider implements IRiskRuleStatisticsProvider {
  async getStatistics(input: {
    totalRiskRules: number;
    activeRiskRules: number;
    categories: readonly string[];
  }): Promise<RiskRuleRegistryStatistics> {
    return Object.freeze({
      totalRiskRules: input.totalRiskRules,
      activeRiskRules: input.activeRiskRules,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

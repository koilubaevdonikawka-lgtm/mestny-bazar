import type { RiskRuleRegistryStatistics } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

export interface IRiskRuleStatisticsProvider {
  getStatistics(input: {
    totalRiskRules: number;
    activeRiskRules: number;
    categories: readonly string[];
  }): Promise<RiskRuleRegistryStatistics>;
}

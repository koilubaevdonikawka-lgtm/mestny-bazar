import type { SafetyRuleRegistryStatistics } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

export interface ISafetyRuleStatisticsProvider {
  getStatistics(input: {
    totalSafetyRules: number;
    activeSafetyRules: number;
    categories: readonly string[];
  }): Promise<SafetyRuleRegistryStatistics>;
}

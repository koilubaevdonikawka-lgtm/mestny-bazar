import type { RuleRegistryStatistics } from "@server/application/ai-rule-registry/models/rule.model";

export interface IRuleStatisticsProvider {
  getStatistics(input: {
    totalRules: number;
    activeRules: number;
    categories: readonly string[];
  }): Promise<RuleRegistryStatistics>;
}

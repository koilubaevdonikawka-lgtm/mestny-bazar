import type { ComplianceRuleRegistryStatistics } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

export interface IComplianceRuleStatisticsProvider {
  getStatistics(input: {
    totalComplianceRules: number;
    activeComplianceRules: number;
    categories: readonly string[];
  }): Promise<ComplianceRuleRegistryStatistics>;
}

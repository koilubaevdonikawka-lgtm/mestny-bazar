import type { IComplianceRuleStatisticsProvider } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-statistics-provider.contract";
import type { ComplianceRuleRegistryStatistics } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Default in-memory compliance rule statistics provider. */
export class DefaultComplianceRuleStatisticsProvider implements IComplianceRuleStatisticsProvider {
  async getStatistics(input: {
    totalComplianceRules: number;
    activeComplianceRules: number;
    categories: readonly string[];
  }): Promise<ComplianceRuleRegistryStatistics> {
    return Object.freeze({
      totalComplianceRules: input.totalComplianceRules,
      activeComplianceRules: input.activeComplianceRules,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

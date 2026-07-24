import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Future integration point for compliance rule synchronization. Not wired yet. */
export interface IComplianceRuleSynchronizationProvider {
  synchronize(complianceRules: readonly ComplianceRule[]): Promise<void>;
}

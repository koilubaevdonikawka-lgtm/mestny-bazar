import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Future integration point for compliance rule export. Not wired yet. */
export interface IComplianceRuleExportProvider {
  exportRules(complianceRules: readonly ComplianceRule[]): Promise<string>;
}

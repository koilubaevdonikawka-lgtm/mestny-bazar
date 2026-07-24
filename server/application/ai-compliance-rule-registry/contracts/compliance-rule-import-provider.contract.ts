import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Future integration point for compliance rule import. Not wired yet. */
export interface IComplianceRuleImportProvider {
  importRules(source: string): Promise<readonly ComplianceRule[]>;
}

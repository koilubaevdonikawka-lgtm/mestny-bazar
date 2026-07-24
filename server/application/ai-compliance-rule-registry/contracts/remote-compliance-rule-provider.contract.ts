import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Future integration point for external compliance rule providers. Not wired yet. */
export interface IRemoteComplianceRuleProvider {
  fetchRemote(complianceRuleId: string): Promise<ComplianceRule | null>;
  pushRemote(complianceRule: ComplianceRule): Promise<void>;
}

import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

export interface IComplianceRuleSerializer {
  serialize(complianceRule: ComplianceRule): Promise<string>;
  deserialize(serialized: string): Promise<ComplianceRule>;
}

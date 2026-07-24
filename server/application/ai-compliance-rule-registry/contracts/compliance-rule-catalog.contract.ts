import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

export interface IComplianceRuleCatalog {
  register(complianceRule: ComplianceRule): Promise<void>;
  remove(complianceRuleId: string): Promise<void>;
  findById(complianceRuleId: string): Promise<ComplianceRule | null>;
  findByName(name: string): Promise<ComplianceRule | null>;
  findByCategory(category: string): Promise<readonly ComplianceRule[]>;
  listAll(): Promise<readonly ComplianceRule[]>;
}

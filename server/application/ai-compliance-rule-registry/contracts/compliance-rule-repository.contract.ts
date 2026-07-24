import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

export interface IComplianceRuleRepository {
  save(complianceRule: ComplianceRule): Promise<void>;
  findById(complianceRuleId: string): Promise<ComplianceRule | null>;
  findByName(name: string): Promise<ComplianceRule | null>;
  findByCategory(category: string): Promise<readonly ComplianceRule[]>;
  findAll(): Promise<readonly ComplianceRule[]>;
  delete(complianceRuleId: string): Promise<boolean>;
}

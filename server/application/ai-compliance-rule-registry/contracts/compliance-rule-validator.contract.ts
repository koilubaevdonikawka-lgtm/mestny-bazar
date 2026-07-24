import type {
  ComplianceRule,
  RegisterComplianceRuleInput,
  UpdateComplianceRuleInput,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

export interface ComplianceRuleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IComplianceRuleValidator {
  validateRegistration(input: RegisterComplianceRuleInput): Promise<ComplianceRuleValidationResult>;
  validateUpdate(
    existing: ComplianceRule,
    input: UpdateComplianceRuleInput,
  ): Promise<ComplianceRuleValidationResult>;
}

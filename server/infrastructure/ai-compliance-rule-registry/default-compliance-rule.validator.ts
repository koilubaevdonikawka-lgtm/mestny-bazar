import type {
  ComplianceRuleValidationResult,
  IComplianceRuleValidator,
} from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-validator.contract";
import type {
  ComplianceRule,
  RegisterComplianceRuleInput,
  UpdateComplianceRuleInput,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Default compliance rule validator. */
export class DefaultComplianceRuleValidator implements IComplianceRuleValidator {
  async validateRegistration(input: RegisterComplianceRuleInput): Promise<ComplianceRuleValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Compliance rule name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Compliance rule category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compliance rule status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ComplianceRule,
    input: UpdateComplianceRuleInput,
  ): Promise<ComplianceRuleValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Compliance rule name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Compliance rule category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compliance rule status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Compliance rule is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

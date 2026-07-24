import type {
  IRiskRuleValidator,
  RiskRuleValidationResult,
} from "@server/application/ai-risk-rule-registry/contracts/risk-rule-validator.contract";
import type {
  RegisterRiskRuleInput,
  RiskRule,
  UpdateRiskRuleInput,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Default risk rule validator. */
export class DefaultRiskRuleValidator implements IRiskRuleValidator {
  async validateRegistration(input: RegisterRiskRuleInput): Promise<RiskRuleValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Risk rule name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Risk rule category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Risk rule status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: RiskRule,
    input: UpdateRiskRuleInput,
  ): Promise<RiskRuleValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Risk rule name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Risk rule category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Risk rule status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Risk rule is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

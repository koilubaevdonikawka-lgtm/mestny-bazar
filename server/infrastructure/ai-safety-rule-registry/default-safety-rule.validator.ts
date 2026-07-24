import type {
  ISafetyRuleValidator,
  SafetyRuleValidationResult,
} from "@server/application/ai-safety-rule-registry/contracts/safety-rule-validator.contract";
import type {
  RegisterSafetyRuleInput,
  SafetyRule,
  UpdateSafetyRuleInput,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Default safety rule validator. */
export class DefaultSafetyRuleValidator implements ISafetyRuleValidator {
  async validateRegistration(input: RegisterSafetyRuleInput): Promise<SafetyRuleValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Safety rule name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Safety rule category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Safety rule status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: SafetyRule,
    input: UpdateSafetyRuleInput,
  ): Promise<SafetyRuleValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Safety rule name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Safety rule category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Safety rule status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Safety rule is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

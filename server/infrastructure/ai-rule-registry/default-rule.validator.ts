import type {
  IRuleValidator,
  RuleValidationResult,
} from "@server/application/ai-rule-registry/contracts/rule-validator.contract";
import type {
  RegisterRuleInput,
  Rule,
  UpdateRuleInput,
} from "@server/application/ai-rule-registry/models/rule.model";

/** Default rule validator. */
export class DefaultRuleValidator implements IRuleValidator {
  async validateRegistration(input: RegisterRuleInput): Promise<RuleValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Rule name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Rule category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Rule status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Rule, input: UpdateRuleInput): Promise<RuleValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Rule name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Rule category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Rule status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Rule is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

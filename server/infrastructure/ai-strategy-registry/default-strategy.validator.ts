import type {
  IStrategyValidator,
  StrategyValidationResult,
} from "@server/application/ai-strategy-registry/contracts/strategy-validator.contract";
import type {
  RegisterStrategyInput,
  Strategy,
  UpdateStrategyInput,
} from "@server/application/ai-strategy-registry/models/strategy.model";

/** Default strategy validator. */
export class DefaultStrategyValidator implements IStrategyValidator {
  async validateRegistration(input: RegisterStrategyInput): Promise<StrategyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Strategy name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Strategy category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Strategy status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Strategy,
    input: UpdateStrategyInput,
  ): Promise<StrategyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Strategy name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Strategy category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Strategy status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Strategy is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

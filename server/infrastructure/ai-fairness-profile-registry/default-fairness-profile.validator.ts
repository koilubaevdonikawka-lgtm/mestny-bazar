import type {
  FairnessProfileValidationResult,
  IFairnessProfileValidator,
} from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-validator.contract";
import type {
  FairnessProfile,
  RegisterFairnessProfileInput,
  UpdateFairnessProfileInput,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Default fairness profile validator. */
export class DefaultFairnessProfileValidator implements IFairnessProfileValidator {
  async validateRegistration(input: RegisterFairnessProfileInput): Promise<FairnessProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Fairness profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Fairness profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Fairness profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: FairnessProfile,
    input: UpdateFairnessProfileInput,
  ): Promise<FairnessProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Fairness profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Fairness profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Fairness profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Fairness profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

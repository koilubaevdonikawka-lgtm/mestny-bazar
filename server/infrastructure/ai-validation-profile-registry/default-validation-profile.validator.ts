import type {
  IValidationProfileValidator,
  ValidationProfileValidationResult,
} from "@server/application/ai-validation-profile-registry/contracts/validation-profile-validator.contract";
import type {
  RegisterValidationProfileInput,
  ValidationProfile,
  UpdateValidationProfileInput,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Default validation profile validator. */
export class DefaultValidationProfileValidator implements IValidationProfileValidator {
  async validateRegistration(input: RegisterValidationProfileInput): Promise<ValidationProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Validation profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Validation profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Validation profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: ValidationProfile, input: UpdateValidationProfileInput): Promise<ValidationProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Validation profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Validation profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Validation profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Validation profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

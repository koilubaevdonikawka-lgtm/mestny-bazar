import type {
  SafetyProfileValidationResult,
  ISafetyProfileValidator,
} from "@server/application/ai-safety-profile-registry/contracts/safety-profile-validator.contract";
import type {
  SafetyProfile,
  RegisterSafetyProfileInput,
  UpdateSafetyProfileInput,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Default safety profile validator. */
export class DefaultSafetyProfileValidator implements ISafetyProfileValidator {
  async validateRegistration(input: RegisterSafetyProfileInput): Promise<SafetyProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Safety profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Safety profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Safety profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: SafetyProfile,
    input: UpdateSafetyProfileInput,
  ): Promise<SafetyProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Safety profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Safety profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Safety profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Safety profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

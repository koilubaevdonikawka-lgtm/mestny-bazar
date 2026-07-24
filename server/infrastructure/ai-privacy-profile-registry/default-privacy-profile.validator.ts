import type {
  PrivacyProfileValidationResult,
  IPrivacyProfileValidator,
} from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-validator.contract";
import type {
  PrivacyProfile,
  RegisterPrivacyProfileInput,
  UpdatePrivacyProfileInput,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Default privacy profile validator. */
export class DefaultPrivacyProfileValidator implements IPrivacyProfileValidator {
  async validateRegistration(input: RegisterPrivacyProfileInput): Promise<PrivacyProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Privacy profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Privacy profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Privacy profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: PrivacyProfile,
    input: UpdatePrivacyProfileInput,
  ): Promise<PrivacyProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Privacy profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Privacy profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Privacy profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Privacy profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

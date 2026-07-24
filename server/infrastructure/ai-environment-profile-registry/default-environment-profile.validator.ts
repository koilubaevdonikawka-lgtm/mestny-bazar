import type {
  EnvironmentProfileValidationResult,
  IEnvironmentProfileValidator,
} from "@server/application/ai-environment-profile-registry/contracts/environment-profile-validator.contract";
import type {
  EnvironmentProfile,
  RegisterEnvironmentProfileInput,
  UpdateEnvironmentProfileInput,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Default environment profile validator. */
export class DefaultEnvironmentProfileValidator implements IEnvironmentProfileValidator {
  async validateRegistration(
    input: RegisterEnvironmentProfileInput,
  ): Promise<EnvironmentProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Environment profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Environment profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Environment profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: EnvironmentProfile,
    input: UpdateEnvironmentProfileInput,
  ): Promise<EnvironmentProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Environment profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Environment profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Environment profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Environment profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

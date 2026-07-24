import type {
  IProfileValidator,
  ProfileValidationResult,
} from "@server/application/ai-profile-registry/contracts/profile-validator.contract";
import type {
  Profile,
  RegisterProfileInput,
  UpdateProfileInput,
} from "@server/application/ai-profile-registry/models/profile.model";

/** Default profile validator. */
export class DefaultProfileValidator implements IProfileValidator {
  async validateRegistration(input: RegisterProfileInput): Promise<ProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Profile name is required.");
    }
    if (!input.type?.trim()) {
      errors.push("Profile type is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Profile,
    input: UpdateProfileInput,
  ): Promise<ProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Profile name cannot be empty.");
    }
    if (input.type !== undefined && !input.type.trim()) {
      errors.push("Profile type cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

import type {
  IRuntimeProfileValidator,
  RuntimeProfileValidationResult,
} from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-validator.contract";
import type {
  RegisterRuntimeProfileInput,
  RuntimeProfile,
  UpdateRuntimeProfileInput,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Default runtime profile validator. */
export class DefaultRuntimeProfileValidator implements IRuntimeProfileValidator {
  async validateRegistration(input: RegisterRuntimeProfileInput): Promise<RuntimeProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Runtime profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Runtime profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Runtime profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: RuntimeProfile, input: UpdateRuntimeProfileInput): Promise<RuntimeProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Runtime profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Runtime profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Runtime profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Runtime profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

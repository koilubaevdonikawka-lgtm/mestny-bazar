import type {
  ComputeProfileValidationResult,
  IComputeProfileValidator,
} from "@server/application/ai-compute-profile-registry/contracts/compute-profile-validator.contract";
import type {
  ComputeProfile,
  RegisterComputeProfileInput,
  UpdateComputeProfileInput,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Default compute profile validator. */
export class DefaultComputeProfileValidator implements IComputeProfileValidator {
  async validateRegistration(input: RegisterComputeProfileInput): Promise<ComputeProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Compute profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Compute profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compute profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ComputeProfile,
    input: UpdateComputeProfileInput,
  ): Promise<ComputeProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Compute profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Compute profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compute profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Compute profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

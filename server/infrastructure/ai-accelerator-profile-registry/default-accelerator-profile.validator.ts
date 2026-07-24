import type {
  AcceleratorProfileValidationResult,
  IAcceleratorProfileValidator,
} from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-validator.contract";
import type {
  AcceleratorProfile,
  RegisterAcceleratorProfileInput,
  UpdateAcceleratorProfileInput,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Default accelerator profile validator. */
export class DefaultAcceleratorProfileValidator implements IAcceleratorProfileValidator {
  async validateRegistration(input: RegisterAcceleratorProfileInput): Promise<AcceleratorProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Accelerator profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Accelerator profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Accelerator profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: AcceleratorProfile,
    input: UpdateAcceleratorProfileInput,
  ): Promise<AcceleratorProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Accelerator profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Accelerator profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Accelerator profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Accelerator profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

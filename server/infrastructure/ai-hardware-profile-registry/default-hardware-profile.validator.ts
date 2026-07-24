import type {
  HardwareProfileValidationResult,
  IHardwareProfileValidator,
} from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-validator.contract";
import type {
  HardwareProfile,
  RegisterHardwareProfileInput,
  UpdateHardwareProfileInput,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Default hardware profile validator. */
export class DefaultHardwareProfileValidator implements IHardwareProfileValidator {
  async validateRegistration(input: RegisterHardwareProfileInput): Promise<HardwareProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Hardware profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Hardware profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Hardware profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: HardwareProfile,
    input: UpdateHardwareProfileInput,
  ): Promise<HardwareProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Hardware profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Hardware profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Hardware profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Hardware profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

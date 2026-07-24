import type {
  CapabilityProfileValidationResult,
  ICapabilityProfileValidator,
} from "@server/application/ai-capability-profile-registry/contracts/capability-profile-validator.contract";
import type {
  CapabilityProfile,
  RegisterCapabilityProfileInput,
  UpdateCapabilityProfileInput,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Default capability profile validator. */
export class DefaultCapabilityProfileValidator implements ICapabilityProfileValidator {
  async validateRegistration(input: RegisterCapabilityProfileInput): Promise<CapabilityProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Capability profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Capability profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Capability profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: CapabilityProfile,
    input: UpdateCapabilityProfileInput,
  ): Promise<CapabilityProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Capability profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Capability profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Capability profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Capability profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

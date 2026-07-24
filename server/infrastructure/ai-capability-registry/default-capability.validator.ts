import type {
  CapabilityValidationResult,
  ICapabilityValidator,
} from "@server/application/ai-capability-registry/contracts/capability-validator.contract";
import type {
  Capability,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-registry/models/capability.model";

/** Default capability validator. */
export class DefaultCapabilityValidator implements ICapabilityValidator {
  async validateRegistration(input: RegisterCapabilityInput): Promise<CapabilityValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Capability name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Capability category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Capability status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Capability,
    input: UpdateCapabilityInput,
  ): Promise<CapabilityValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Capability name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Capability category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Capability status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Capability is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

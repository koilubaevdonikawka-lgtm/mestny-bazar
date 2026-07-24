import type {
  MemoryProfileValidationResult,
  IMemoryProfileValidator,
} from "@server/application/ai-memory-profile-registry/contracts/memory-profile-validator.contract";
import type {
  MemoryProfile,
  RegisterMemoryProfileInput,
  UpdateMemoryProfileInput,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Default memory profile validator. */
export class DefaultMemoryProfileValidator implements IMemoryProfileValidator {
  async validateRegistration(input: RegisterMemoryProfileInput): Promise<MemoryProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Memory profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Memory profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Memory profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: MemoryProfile,
    input: UpdateMemoryProfileInput,
  ): Promise<MemoryProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Memory profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Memory profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Memory profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Memory profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

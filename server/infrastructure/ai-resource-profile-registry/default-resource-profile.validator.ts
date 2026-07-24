import type {
  ResourceProfileValidationResult,
  IResourceProfileValidator,
} from "@server/application/ai-resource-profile-registry/contracts/resource-profile-validator.contract";
import type {
  ResourceProfile,
  RegisterResourceProfileInput,
  UpdateResourceProfileInput,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Default resource profile validator. */
export class DefaultResourceProfileValidator implements IResourceProfileValidator {
  async validateRegistration(input: RegisterResourceProfileInput): Promise<ResourceProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Resource profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Resource profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ResourceProfile,
    input: UpdateResourceProfileInput,
  ): Promise<ResourceProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Resource profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Resource profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Resource profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

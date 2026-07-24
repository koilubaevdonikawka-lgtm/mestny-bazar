import type {
  IResourceValidator,
  ResourceValidationResult,
} from "@server/application/ai-resource-registry/contracts/resource-validator.contract";
import type {
  RegisterResourceInput,
  Resource,
  UpdateResourceInput,
} from "@server/application/ai-resource-registry/models/resource.model";

/** Default resource validator. */
export class DefaultResourceValidator implements IResourceValidator {
  async validateRegistration(input: RegisterResourceInput): Promise<ResourceValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Resource name is required.");
    }
    if (!input.type?.trim()) {
      errors.push("Resource type is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Resource,
    input: UpdateResourceInput,
  ): Promise<ResourceValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Resource name cannot be empty.");
    }
    if (input.type !== undefined && !input.type.trim()) {
      errors.push("Resource type cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Resource is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

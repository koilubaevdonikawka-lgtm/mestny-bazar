import type {
  IResourcePoolValidator,
  ResourcePoolValidationResult,
} from "@server/application/ai-resource-pool-registry/contracts/resource-pool-validator.contract";
import type {
  RegisterResourcePoolInput,
  ResourcePool,
  UpdateResourcePoolInput,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Default resource pool validator. */
export class DefaultResourcePoolValidator implements IResourcePoolValidator {
  async validateRegistration(input: RegisterResourcePoolInput): Promise<ResourcePoolValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Resource pool name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Resource pool category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource pool status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ResourcePool,
    input: UpdateResourcePoolInput,
  ): Promise<ResourcePoolValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Resource pool name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Resource pool category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Resource pool status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Resource pool is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

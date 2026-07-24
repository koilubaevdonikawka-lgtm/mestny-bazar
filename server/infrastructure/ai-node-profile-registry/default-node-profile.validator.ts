import type {
  NodeProfileValidationResult,
  INodeProfileValidator,
} from "@server/application/ai-node-profile-registry/contracts/node-profile-validator.contract";
import type {
  NodeProfile,
  RegisterNodeProfileInput,
  UpdateNodeProfileInput,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Default node profile validator. */
export class DefaultNodeProfileValidator implements INodeProfileValidator {
  async validateRegistration(input: RegisterNodeProfileInput): Promise<NodeProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Node profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Node profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Node profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: NodeProfile,
    input: UpdateNodeProfileInput,
  ): Promise<NodeProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Node profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Node profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Node profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Node profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

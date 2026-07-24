import type {
  ClusterProfileValidationResult,
  IClusterProfileValidator,
} from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-validator.contract";
import type {
  ClusterProfile,
  RegisterClusterProfileInput,
  UpdateClusterProfileInput,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Default cluster profile validator. */
export class DefaultClusterProfileValidator implements IClusterProfileValidator {
  async validateRegistration(input: RegisterClusterProfileInput): Promise<ClusterProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Cluster profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Cluster profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Cluster profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ClusterProfile,
    input: UpdateClusterProfileInput,
  ): Promise<ClusterProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Cluster profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Cluster profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Cluster profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Cluster profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

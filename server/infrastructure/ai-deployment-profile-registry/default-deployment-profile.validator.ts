import type {
  DeploymentProfileValidationResult,
  IDeploymentProfileValidator,
} from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-validator.contract";
import type {
  DeploymentProfile,
  RegisterDeploymentProfileInput,
  UpdateDeploymentProfileInput,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Default deployment profile validator. */
export class DefaultDeploymentProfileValidator implements IDeploymentProfileValidator {
  async validateRegistration(
    input: RegisterDeploymentProfileInput,
  ): Promise<DeploymentProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Deployment profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Deployment profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Deployment profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: DeploymentProfile,
    input: UpdateDeploymentProfileInput,
  ): Promise<DeploymentProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Deployment profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Deployment profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Deployment profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Deployment profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

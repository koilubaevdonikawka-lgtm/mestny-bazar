import type {
  DeploymentProfile,
  RegisterDeploymentProfileInput,
  UpdateDeploymentProfileInput,
} from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

export interface DeploymentProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IDeploymentProfileValidator {
  validateRegistration(input: RegisterDeploymentProfileInput): Promise<DeploymentProfileValidationResult>;
  validateUpdate(
    existing: DeploymentProfile,
    input: UpdateDeploymentProfileInput,
  ): Promise<DeploymentProfileValidationResult>;
}

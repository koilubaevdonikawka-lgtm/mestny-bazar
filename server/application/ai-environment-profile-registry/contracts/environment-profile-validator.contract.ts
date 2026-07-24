import type {
  RegisterEnvironmentProfileInput,
  EnvironmentProfile,
  UpdateEnvironmentProfileInput,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

export interface EnvironmentProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IEnvironmentProfileValidator {
  validateRegistration(input: RegisterEnvironmentProfileInput): Promise<EnvironmentProfileValidationResult>;
  validateUpdate(existing: EnvironmentProfile, input: UpdateEnvironmentProfileInput): Promise<EnvironmentProfileValidationResult>;
}

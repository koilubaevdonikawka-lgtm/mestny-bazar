import type {
  InfrastructureProfile,
  RegisterInfrastructureProfileInput,
  UpdateInfrastructureProfileInput,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

export interface InfrastructureProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IInfrastructureProfileValidator {
  validateRegistration(
    input: RegisterInfrastructureProfileInput,
  ): Promise<InfrastructureProfileValidationResult>;
  validateUpdate(
    existing: InfrastructureProfile,
    input: UpdateInfrastructureProfileInput,
  ): Promise<InfrastructureProfileValidationResult>;
}

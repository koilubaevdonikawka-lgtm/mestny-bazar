import type {
  ComputeProfile,
  RegisterComputeProfileInput,
  UpdateComputeProfileInput,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

export interface ComputeProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IComputeProfileValidator {
  validateRegistration(input: RegisterComputeProfileInput): Promise<ComputeProfileValidationResult>;
  validateUpdate(
    existing: ComputeProfile,
    input: UpdateComputeProfileInput,
  ): Promise<ComputeProfileValidationResult>;
}

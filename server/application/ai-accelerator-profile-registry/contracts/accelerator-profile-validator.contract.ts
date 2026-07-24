import type {
  AcceleratorProfile,
  RegisterAcceleratorProfileInput,
  UpdateAcceleratorProfileInput,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

export interface AcceleratorProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IAcceleratorProfileValidator {
  validateRegistration(input: RegisterAcceleratorProfileInput): Promise<AcceleratorProfileValidationResult>;
  validateUpdate(
    existing: AcceleratorProfile,
    input: UpdateAcceleratorProfileInput,
  ): Promise<AcceleratorProfileValidationResult>;
}

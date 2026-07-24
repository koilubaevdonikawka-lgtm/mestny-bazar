import type {
  RegisterValidationProfileInput,
  ValidationProfile,
  UpdateValidationProfileInput,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

export interface ValidationProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IValidationProfileValidator {
  validateRegistration(input: RegisterValidationProfileInput): Promise<ValidationProfileValidationResult>;
  validateUpdate(existing: ValidationProfile, input: UpdateValidationProfileInput): Promise<ValidationProfileValidationResult>;
}

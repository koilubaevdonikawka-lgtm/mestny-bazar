import type {
  SafetyProfile,
  RegisterSafetyProfileInput,
  UpdateSafetyProfileInput,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

export interface SafetyProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISafetyProfileValidator {
  validateRegistration(input: RegisterSafetyProfileInput): Promise<SafetyProfileValidationResult>;
  validateUpdate(
    existing: SafetyProfile,
    input: UpdateSafetyProfileInput,
  ): Promise<SafetyProfileValidationResult>;
}

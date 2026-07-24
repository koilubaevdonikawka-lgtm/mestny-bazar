import type {
  PrivacyProfile,
  RegisterPrivacyProfileInput,
  UpdatePrivacyProfileInput,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

export interface PrivacyProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPrivacyProfileValidator {
  validateRegistration(input: RegisterPrivacyProfileInput): Promise<PrivacyProfileValidationResult>;
  validateUpdate(
    existing: PrivacyProfile,
    input: UpdatePrivacyProfileInput,
  ): Promise<PrivacyProfileValidationResult>;
}

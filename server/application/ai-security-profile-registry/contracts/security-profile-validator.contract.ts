import type {
  SecurityProfile,
  RegisterSecurityProfileInput,
  UpdateSecurityProfileInput,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";

export interface SecurityProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISecurityProfileValidator {
  validateRegistration(input: RegisterSecurityProfileInput): Promise<SecurityProfileValidationResult>;
  validateUpdate(
    existing: SecurityProfile,
    input: UpdateSecurityProfileInput,
  ): Promise<SecurityProfileValidationResult>;
}

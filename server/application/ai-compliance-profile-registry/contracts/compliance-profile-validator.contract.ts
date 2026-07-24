import type {
  ComplianceProfile,
  RegisterComplianceProfileInput,
  UpdateComplianceProfileInput,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

export interface ComplianceProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IComplianceProfileValidator {
  validateRegistration(input: RegisterComplianceProfileInput): Promise<ComplianceProfileValidationResult>;
  validateUpdate(
    existing: ComplianceProfile,
    input: UpdateComplianceProfileInput,
  ): Promise<ComplianceProfileValidationResult>;
}

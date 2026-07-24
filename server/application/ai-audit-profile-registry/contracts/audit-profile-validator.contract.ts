import type {
  AuditProfile,
  RegisterAuditProfileInput,
  UpdateAuditProfileInput,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

export interface AuditProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IAuditProfileValidator {
  validateRegistration(input: RegisterAuditProfileInput): Promise<AuditProfileValidationResult>;
  validateUpdate(
    existing: AuditProfile,
    input: UpdateAuditProfileInput,
  ): Promise<AuditProfileValidationResult>;
}

import type {
  AuditProfileValidationResult,
  IAuditProfileValidator,
} from "@server/application/ai-audit-profile-registry/contracts/audit-profile-validator.contract";
import type {
  AuditProfile,
  RegisterAuditProfileInput,
  UpdateAuditProfileInput,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Default audit profile validator. */
export class DefaultAuditProfileValidator implements IAuditProfileValidator {
  async validateRegistration(input: RegisterAuditProfileInput): Promise<AuditProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Audit profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Audit profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Audit profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: AuditProfile,
    input: UpdateAuditProfileInput,
  ): Promise<AuditProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Audit profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Audit profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Audit profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Audit profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

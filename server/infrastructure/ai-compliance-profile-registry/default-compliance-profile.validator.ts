import type {
  ComplianceProfileValidationResult,
  IComplianceProfileValidator,
} from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-validator.contract";
import type {
  ComplianceProfile,
  RegisterComplianceProfileInput,
  UpdateComplianceProfileInput,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Default compliance profile validator. */
export class DefaultComplianceProfileValidator implements IComplianceProfileValidator {
  async validateRegistration(input: RegisterComplianceProfileInput): Promise<ComplianceProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Compliance profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Compliance profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compliance profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ComplianceProfile,
    input: UpdateComplianceProfileInput,
  ): Promise<ComplianceProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Compliance profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Compliance profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Compliance profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Compliance profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

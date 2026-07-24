import type {
  SecurityProfileValidationResult,
  ISecurityProfileValidator,
} from "@server/application/ai-security-profile-registry/contracts/security-profile-validator.contract";
import type {
  SecurityProfile,
  RegisterSecurityProfileInput,
  UpdateSecurityProfileInput,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Default security profile validator. */
export class DefaultSecurityProfileValidator implements ISecurityProfileValidator {
  async validateRegistration(input: RegisterSecurityProfileInput): Promise<SecurityProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Security profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Security profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Security profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: SecurityProfile,
    input: UpdateSecurityProfileInput,
  ): Promise<SecurityProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Security profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Security profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Security profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Security profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

import type {
  GovernanceProfileValidationResult,
  IGovernanceProfileValidator,
} from "@server/application/ai-governance-profile-registry/contracts/governance-profile-validator.contract";
import type {
  GovernanceProfile,
  RegisterGovernanceProfileInput,
  UpdateGovernanceProfileInput,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Default governance profile validator. */
export class DefaultGovernanceProfileValidator implements IGovernanceProfileValidator {
  async validateRegistration(input: RegisterGovernanceProfileInput): Promise<GovernanceProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Governance profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Governance profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Governance profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: GovernanceProfile,
    input: UpdateGovernanceProfileInput,
  ): Promise<GovernanceProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Governance profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Governance profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Governance profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Governance profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

import type {
  RiskProfileValidationResult,
  IRiskProfileValidator,
} from "@server/application/ai-risk-profile-registry/contracts/risk-profile-validator.contract";
import type {
  RiskProfile,
  RegisterRiskProfileInput,
  UpdateRiskProfileInput,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Default risk profile validator. */
export class DefaultRiskProfileValidator implements IRiskProfileValidator {
  async validateRegistration(input: RegisterRiskProfileInput): Promise<RiskProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Risk profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Risk profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Risk profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: RiskProfile,
    input: UpdateRiskProfileInput,
  ): Promise<RiskProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Risk profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Risk profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Risk profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Risk profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

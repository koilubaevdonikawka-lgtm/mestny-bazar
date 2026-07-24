import type {
  ExplainabilityProfileValidationResult,
  IExplainabilityProfileValidator,
} from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-validator.contract";
import type {
  ExplainabilityProfile,
  RegisterExplainabilityProfileInput,
  UpdateExplainabilityProfileInput,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Default explainability profile validator. */
export class DefaultExplainabilityProfileValidator implements IExplainabilityProfileValidator {
  async validateRegistration(input: RegisterExplainabilityProfileInput): Promise<ExplainabilityProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Explainability profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Explainability profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Explainability profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ExplainabilityProfile,
    input: UpdateExplainabilityProfileInput,
  ): Promise<ExplainabilityProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Explainability profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Explainability profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Explainability profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Explainability profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

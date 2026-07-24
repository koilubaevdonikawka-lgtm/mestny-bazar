import type {
  TrustProfileValidationResult,
  ITrustProfileValidator,
} from "@server/application/ai-trust-profile-registry/contracts/trust-profile-validator.contract";
import type {
  TrustProfile,
  RegisterTrustProfileInput,
  UpdateTrustProfileInput,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Default trust profile validator. */
export class DefaultTrustProfileValidator implements ITrustProfileValidator {
  async validateRegistration(input: RegisterTrustProfileInput): Promise<TrustProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Trust profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Trust profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Trust profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: TrustProfile,
    input: UpdateTrustProfileInput,
  ): Promise<TrustProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Trust profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Trust profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Trust profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Trust profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

import type {
  AccountabilityProfileValidationResult,
  IAccountabilityProfileValidator,
} from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-validator.contract";
import type {
  AccountabilityProfile,
  RegisterAccountabilityProfileInput,
  UpdateAccountabilityProfileInput,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Default accountability profile validator. */
export class DefaultAccountabilityProfileValidator implements IAccountabilityProfileValidator {
  async validateRegistration(input: RegisterAccountabilityProfileInput): Promise<AccountabilityProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Accountability profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Accountability profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Accountability profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: AccountabilityProfile,
    input: UpdateAccountabilityProfileInput,
  ): Promise<AccountabilityProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Accountability profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Accountability profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Accountability profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Accountability profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

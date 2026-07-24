import type {
  PolicyProfileValidationResult,
  IPolicyProfileValidator,
} from "@server/application/ai-policy-profile-registry/contracts/policy-profile-validator.contract";
import type {
  PolicyProfile,
  RegisterPolicyProfileInput,
  UpdatePolicyProfileInput,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Default policy profile validator. */
export class DefaultPolicyProfileValidator implements IPolicyProfileValidator {
  async validateRegistration(input: RegisterPolicyProfileInput): Promise<PolicyProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Policy profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Policy profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: PolicyProfile,
    input: UpdatePolicyProfileInput,
  ): Promise<PolicyProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Policy profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Policy profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Policy profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

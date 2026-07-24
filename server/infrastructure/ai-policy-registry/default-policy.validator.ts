import type {
  IPolicyValidator,
  PolicyValidationResult,
} from "@server/application/ai-policy-registry/contracts/policy-validator.contract";
import type {
  Policy,
  RegisterPolicyInput,
  UpdatePolicyInput,
} from "@server/application/ai-policy-registry/models/policy.model";

/** Default policy validator. */
export class DefaultPolicyValidator implements IPolicyValidator {
  async validateRegistration(input: RegisterPolicyInput): Promise<PolicyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Policy name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Policy category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Policy,
    input: UpdatePolicyInput,
  ): Promise<PolicyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Policy name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Policy category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Policy is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

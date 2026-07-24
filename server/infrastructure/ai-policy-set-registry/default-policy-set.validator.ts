import type {
  IPolicySetValidator,
  PolicySetValidationResult,
} from "@server/application/ai-policy-set-registry/contracts/policy-set-validator.contract";
import type {
  RegisterPolicySetInput,
  PolicySet,
  UpdatePolicySetInput,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Default policy set validator. */
export class DefaultPolicySetValidator implements IPolicySetValidator {
  async validateRegistration(input: RegisterPolicySetInput): Promise<PolicySetValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Policy set name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Policy set category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy set status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: PolicySet, input: UpdatePolicySetInput): Promise<PolicySetValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Policy set name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Policy set category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Policy set status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Policy set is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

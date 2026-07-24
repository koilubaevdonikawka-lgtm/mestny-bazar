import type {
  GovernancePolicyValidationResult,
  IGovernancePolicyValidator,
} from "@server/application/ai-governance-policy-registry/contracts/governance-policy-validator.contract";
import type {
  GovernancePolicy,
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyInput,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Default governance policy validator. */
export class DefaultGovernancePolicyValidator implements IGovernancePolicyValidator {
  async validateRegistration(input: RegisterGovernancePolicyInput): Promise<GovernancePolicyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Governance policy name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Governance policy category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Governance policy status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: GovernancePolicy,
    input: UpdateGovernancePolicyInput,
  ): Promise<GovernancePolicyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Governance policy name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Governance policy category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Governance policy status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Governance policy is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

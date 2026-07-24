import type {
  GovernancePolicy,
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyInput,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

export interface GovernancePolicyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IGovernancePolicyValidator {
  validateRegistration(input: RegisterGovernancePolicyInput): Promise<GovernancePolicyValidationResult>;
  validateUpdate(
    existing: GovernancePolicy,
    input: UpdateGovernancePolicyInput,
  ): Promise<GovernancePolicyValidationResult>;
}

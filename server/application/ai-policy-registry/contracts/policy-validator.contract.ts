import type {
  Policy,
  RegisterPolicyInput,
  UpdatePolicyInput,
} from "@server/application/ai-policy-registry/models/policy.model";

export interface PolicyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPolicyValidator {
  validateRegistration(input: RegisterPolicyInput): Promise<PolicyValidationResult>;
  validateUpdate(existing: Policy, input: UpdatePolicyInput): Promise<PolicyValidationResult>;
}

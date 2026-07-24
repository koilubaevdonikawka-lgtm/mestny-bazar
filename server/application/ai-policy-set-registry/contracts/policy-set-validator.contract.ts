import type {
  RegisterPolicySetInput,
  PolicySet,
  UpdatePolicySetInput,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";

export interface PolicySetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPolicySetValidator {
  validateRegistration(input: RegisterPolicySetInput): Promise<PolicySetValidationResult>;
  validateUpdate(existing: PolicySet, input: UpdatePolicySetInput): Promise<PolicySetValidationResult>;
}

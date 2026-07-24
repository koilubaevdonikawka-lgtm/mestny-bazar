import type {
  PolicyProfile,
  RegisterPolicyProfileInput,
  UpdatePolicyProfileInput,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

export interface PolicyProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPolicyProfileValidator {
  validateRegistration(input: RegisterPolicyProfileInput): Promise<PolicyProfileValidationResult>;
  validateUpdate(
    existing: PolicyProfile,
    input: UpdatePolicyProfileInput,
  ): Promise<PolicyProfileValidationResult>;
}

import type {
  GovernanceProfile,
  RegisterGovernanceProfileInput,
  UpdateGovernanceProfileInput,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

export interface GovernanceProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IGovernanceProfileValidator {
  validateRegistration(input: RegisterGovernanceProfileInput): Promise<GovernanceProfileValidationResult>;
  validateUpdate(
    existing: GovernanceProfile,
    input: UpdateGovernanceProfileInput,
  ): Promise<GovernanceProfileValidationResult>;
}

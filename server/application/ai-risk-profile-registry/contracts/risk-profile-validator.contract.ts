import type {
  RiskProfile,
  RegisterRiskProfileInput,
  UpdateRiskProfileInput,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

export interface RiskProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IRiskProfileValidator {
  validateRegistration(input: RegisterRiskProfileInput): Promise<RiskProfileValidationResult>;
  validateUpdate(
    existing: RiskProfile,
    input: UpdateRiskProfileInput,
  ): Promise<RiskProfileValidationResult>;
}

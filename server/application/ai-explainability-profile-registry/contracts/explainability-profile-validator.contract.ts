import type {
  ExplainabilityProfile,
  RegisterExplainabilityProfileInput,
  UpdateExplainabilityProfileInput,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

export interface ExplainabilityProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IExplainabilityProfileValidator {
  validateRegistration(input: RegisterExplainabilityProfileInput): Promise<ExplainabilityProfileValidationResult>;
  validateUpdate(
    existing: ExplainabilityProfile,
    input: UpdateExplainabilityProfileInput,
  ): Promise<ExplainabilityProfileValidationResult>;
}

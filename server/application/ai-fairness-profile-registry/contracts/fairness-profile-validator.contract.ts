import type {
  FairnessProfile,
  RegisterFairnessProfileInput,
  UpdateFairnessProfileInput,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

export interface FairnessProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IFairnessProfileValidator {
  validateRegistration(input: RegisterFairnessProfileInput): Promise<FairnessProfileValidationResult>;
  validateUpdate(
    existing: FairnessProfile,
    input: UpdateFairnessProfileInput,
  ): Promise<FairnessProfileValidationResult>;
}

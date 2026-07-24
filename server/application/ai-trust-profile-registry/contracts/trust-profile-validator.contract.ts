import type {
  TrustProfile,
  RegisterTrustProfileInput,
  UpdateTrustProfileInput,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

export interface TrustProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ITrustProfileValidator {
  validateRegistration(input: RegisterTrustProfileInput): Promise<TrustProfileValidationResult>;
  validateUpdate(
    existing: TrustProfile,
    input: UpdateTrustProfileInput,
  ): Promise<TrustProfileValidationResult>;
}

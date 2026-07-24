import type {
  TransparencyProfile,
  RegisterTransparencyProfileInput,
  UpdateTransparencyProfileInput,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

export interface TransparencyProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ITransparencyProfileValidator {
  validateRegistration(input: RegisterTransparencyProfileInput): Promise<TransparencyProfileValidationResult>;
  validateUpdate(
    existing: TransparencyProfile,
    input: UpdateTransparencyProfileInput,
  ): Promise<TransparencyProfileValidationResult>;
}

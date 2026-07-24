import type {
  AccountabilityProfile,
  RegisterAccountabilityProfileInput,
  UpdateAccountabilityProfileInput,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

export interface AccountabilityProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IAccountabilityProfileValidator {
  validateRegistration(input: RegisterAccountabilityProfileInput): Promise<AccountabilityProfileValidationResult>;
  validateUpdate(
    existing: AccountabilityProfile,
    input: UpdateAccountabilityProfileInput,
  ): Promise<AccountabilityProfileValidationResult>;
}

import type {
  Profile,
  RegisterProfileInput,
  UpdateProfileInput,
} from "@server/application/ai-profile-registry/models/profile.model";

export interface ProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IProfileValidator {
  validateRegistration(input: RegisterProfileInput): Promise<ProfileValidationResult>;
  validateUpdate(existing: Profile, input: UpdateProfileInput): Promise<ProfileValidationResult>;
}

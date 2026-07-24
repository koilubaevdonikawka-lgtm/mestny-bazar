import type {
  RegisterRuntimeProfileInput,
  RuntimeProfile,
  UpdateRuntimeProfileInput,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

export interface RuntimeProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IRuntimeProfileValidator {
  validateRegistration(input: RegisterRuntimeProfileInput): Promise<RuntimeProfileValidationResult>;
  validateUpdate(existing: RuntimeProfile, input: UpdateRuntimeProfileInput): Promise<RuntimeProfileValidationResult>;
}

import type {
  CapabilityProfile,
  RegisterCapabilityProfileInput,
  UpdateCapabilityProfileInput,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

export interface CapabilityProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ICapabilityProfileValidator {
  validateRegistration(input: RegisterCapabilityProfileInput): Promise<CapabilityProfileValidationResult>;
  validateUpdate(
    existing: CapabilityProfile,
    input: UpdateCapabilityProfileInput,
  ): Promise<CapabilityProfileValidationResult>;
}

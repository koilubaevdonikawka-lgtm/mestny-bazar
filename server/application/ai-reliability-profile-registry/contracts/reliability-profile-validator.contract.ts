import type {
  ReliabilityProfile,
  RegisterReliabilityProfileInput,
  UpdateReliabilityProfileInput,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

export interface ReliabilityProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IReliabilityProfileValidator {
  validateRegistration(input: RegisterReliabilityProfileInput): Promise<ReliabilityProfileValidationResult>;
  validateUpdate(
    existing: ReliabilityProfile,
    input: UpdateReliabilityProfileInput,
  ): Promise<ReliabilityProfileValidationResult>;
}

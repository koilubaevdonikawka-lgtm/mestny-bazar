import type {
  ServiceProfile,
  RegisterServiceProfileInput,
  UpdateServiceProfileInput,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";

export interface ServiceProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IServiceProfileValidator {
  validateRegistration(input: RegisterServiceProfileInput): Promise<ServiceProfileValidationResult>;
  validateUpdate(
    existing: ServiceProfile,
    input: UpdateServiceProfileInput,
  ): Promise<ServiceProfileValidationResult>;
}

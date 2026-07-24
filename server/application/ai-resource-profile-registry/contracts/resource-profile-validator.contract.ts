import type {
  ResourceProfile,
  RegisterResourceProfileInput,
  UpdateResourceProfileInput,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

export interface ResourceProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IResourceProfileValidator {
  validateRegistration(input: RegisterResourceProfileInput): Promise<ResourceProfileValidationResult>;
  validateUpdate(
    existing: ResourceProfile,
    input: UpdateResourceProfileInput,
  ): Promise<ResourceProfileValidationResult>;
}

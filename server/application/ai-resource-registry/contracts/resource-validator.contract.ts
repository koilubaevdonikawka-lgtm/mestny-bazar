import type {
  RegisterResourceInput,
  Resource,
  UpdateResourceInput,
} from "@server/application/ai-resource-registry/models/resource.model";

export interface ResourceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IResourceValidator {
  validateRegistration(input: RegisterResourceInput): Promise<ResourceValidationResult>;
  validateUpdate(existing: Resource, input: UpdateResourceInput): Promise<ResourceValidationResult>;
}

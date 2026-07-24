import type {
  RegisterResourcePoolInput,
  ResourcePool,
  UpdateResourcePoolInput,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

export interface ResourcePoolValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IResourcePoolValidator {
  validateRegistration(input: RegisterResourcePoolInput): Promise<ResourcePoolValidationResult>;
  validateUpdate(existing: ResourcePool, input: UpdateResourcePoolInput): Promise<ResourcePoolValidationResult>;
}

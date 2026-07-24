import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

export interface IResourcePoolRepository {
  save(resourcePool: ResourcePool): Promise<void>;
  findById(resourcePoolId: string): Promise<ResourcePool | null>;
  findByName(name: string): Promise<ResourcePool | null>;
  findByCategory(category: string): Promise<readonly ResourcePool[]>;
  findAll(): Promise<readonly ResourcePool[]>;
  delete(resourcePoolId: string): Promise<boolean>;
}

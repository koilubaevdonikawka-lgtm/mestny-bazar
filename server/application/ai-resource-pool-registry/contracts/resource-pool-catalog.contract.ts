import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

export interface IResourcePoolCatalog {
  register(resourcePool: ResourcePool): Promise<void>;
  remove(resourcePoolId: string): Promise<void>;
  findById(resourcePoolId: string): Promise<ResourcePool | null>;
  findByName(name: string): Promise<ResourcePool | null>;
  findByCategory(category: string): Promise<readonly ResourcePool[]>;
  listAll(): Promise<readonly ResourcePool[]>;
}

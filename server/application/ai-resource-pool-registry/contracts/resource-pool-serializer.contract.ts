import type { ResourcePool } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

export interface IResourcePoolSerializer {
  serialize(resourcePool: ResourcePool): Promise<string>;
  deserialize(serialized: string): Promise<ResourcePool>;
}

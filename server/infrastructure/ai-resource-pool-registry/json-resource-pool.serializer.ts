import type { IResourcePoolSerializer } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-serializer.contract";
import {
  createResourcePool,
  type ResourcePool,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** JSON-based resource pool serializer. */
export class JsonResourcePoolSerializer implements IResourcePoolSerializer {
  async serialize(resourcePool: ResourcePool): Promise<string> {
    return JSON.stringify(resourcePool);
  }

  async deserialize(serialized: string): Promise<ResourcePool> {
    if (!serialized.trim()) {
      throw new Error("Serialized resource pool cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ResourcePool>;
    return createResourcePool({
      resourcePoolId: parsed.resourcePoolId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

import type { IResourceSerializer } from "@server/application/ai-resource-registry/contracts/resource-serializer.contract";
import {
  createResource,
  type Resource,
} from "@server/application/ai-resource-registry/models/resource.model";

/** JSON-based resource serializer. */
export class JsonResourceSerializer implements IResourceSerializer {
  async serialize(resource: Resource): Promise<string> {
    return JSON.stringify(resource);
  }

  async deserialize(serialized: string): Promise<Resource> {
    if (!serialized.trim()) {
      throw new Error("Serialized resource cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Resource>;
    return createResource({
      resourceId: parsed.resourceId ?? "",
      name: parsed.name ?? "",
      type: parsed.type ?? "",
      description: parsed.description,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

import type { IResourceProfileSerializer } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-serializer.contract";
import {
  createResourceProfile,
  type ResourceProfile,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** JSON-based resource profile serializer. */
export class JsonResourceProfileSerializer implements IResourceProfileSerializer {
  async serialize(resourceProfile: ResourceProfile): Promise<string> {
    return JSON.stringify(resourceProfile);
  }

  async deserialize(serialized: string): Promise<ResourceProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized resource profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ResourceProfile>;
    return createResourceProfile({
      resourceProfileId: parsed.resourceProfileId ?? "",
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

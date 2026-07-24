import type { IServiceProfileSerializer } from "@server/application/ai-service-profile-registry/contracts/service-profile-serializer.contract";
import {
  createServiceProfile,
  type ServiceProfile,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** JSON-based service profile serializer. */
export class JsonServiceProfileSerializer implements IServiceProfileSerializer {
  async serialize(serviceProfile: ServiceProfile): Promise<string> {
    return JSON.stringify(serviceProfile);
  }

  async deserialize(serialized: string): Promise<ServiceProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized service profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ServiceProfile>;
    return createServiceProfile({
      serviceProfileId: parsed.serviceProfileId ?? "",
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

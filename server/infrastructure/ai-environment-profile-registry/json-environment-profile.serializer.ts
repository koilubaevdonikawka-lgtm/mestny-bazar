import type { IEnvironmentProfileSerializer } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-serializer.contract";
import {
  createEnvironmentProfile,
  type EnvironmentProfile,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** JSON-based environment profile serializer. */
export class JsonEnvironmentProfileSerializer implements IEnvironmentProfileSerializer {
  async serialize(environmentProfile: EnvironmentProfile): Promise<string> {
    return JSON.stringify(environmentProfile);
  }

  async deserialize(serialized: string): Promise<EnvironmentProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized environment profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<EnvironmentProfile>;
    return createEnvironmentProfile({
      environmentProfileId: parsed.environmentProfileId ?? "",
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

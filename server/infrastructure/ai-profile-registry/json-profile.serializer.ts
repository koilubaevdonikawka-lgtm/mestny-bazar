import type { IProfileSerializer } from "@server/application/ai-profile-registry/contracts/profile-serializer.contract";
import {
  createProfile,
  type Profile,
} from "@server/application/ai-profile-registry/models/profile.model";

/** JSON-based profile serializer. */
export class JsonProfileSerializer implements IProfileSerializer {
  async serialize(profile: Profile): Promise<string> {
    return JSON.stringify(profile);
  }

  async deserialize(serialized: string): Promise<Profile> {
    if (!serialized.trim()) {
      throw new Error("Serialized profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Profile>;
    return createProfile({
      profileId: parsed.profileId ?? "",
      name: parsed.name ?? "",
      type: parsed.type ?? "",
      description: parsed.description,
      configuration: parsed.configuration,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

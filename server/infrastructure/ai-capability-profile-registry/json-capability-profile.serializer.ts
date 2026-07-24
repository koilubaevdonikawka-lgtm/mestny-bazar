import type { ICapabilityProfileSerializer } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-serializer.contract";
import {
  createCapabilityProfile,
  type CapabilityProfile,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** JSON-based capability profile serializer. */
export class JsonCapabilityProfileSerializer implements ICapabilityProfileSerializer {
  async serialize(capabilityProfile: CapabilityProfile): Promise<string> {
    return JSON.stringify(capabilityProfile);
  }

  async deserialize(serialized: string): Promise<CapabilityProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized capability profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<CapabilityProfile>;
    return createCapabilityProfile({
      capabilityProfileId: parsed.capabilityProfileId ?? "",
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

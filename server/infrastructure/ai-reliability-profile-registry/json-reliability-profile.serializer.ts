import type { IReliabilityProfileSerializer } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-serializer.contract";
import {
  createReliabilityProfile,
  type ReliabilityProfile,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** JSON-based reliability profile serializer. */
export class JsonReliabilityProfileSerializer implements IReliabilityProfileSerializer {
  async serialize(reliabilityProfile: ReliabilityProfile): Promise<string> {
    return JSON.stringify(reliabilityProfile);
  }

  async deserialize(serialized: string): Promise<ReliabilityProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized reliability profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ReliabilityProfile>;
    return createReliabilityProfile({
      reliabilityProfileId: parsed.reliabilityProfileId ?? "",
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

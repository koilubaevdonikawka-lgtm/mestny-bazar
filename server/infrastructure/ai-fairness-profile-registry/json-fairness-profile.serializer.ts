import type { IFairnessProfileSerializer } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-serializer.contract";
import {
  createFairnessProfile,
  type FairnessProfile,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** JSON-based fairness profile serializer. */
export class JsonFairnessProfileSerializer implements IFairnessProfileSerializer {
  async serialize(fairnessProfile: FairnessProfile): Promise<string> {
    return JSON.stringify(fairnessProfile);
  }

  async deserialize(serialized: string): Promise<FairnessProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized fairness profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<FairnessProfile>;
    return createFairnessProfile({
      fairnessProfileId: parsed.fairnessProfileId ?? "",
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

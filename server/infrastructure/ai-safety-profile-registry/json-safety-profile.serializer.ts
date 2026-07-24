import type { ISafetyProfileSerializer } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-serializer.contract";
import {
  createSafetyProfile,
  type SafetyProfile,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** JSON-based safety profile serializer. */
export class JsonSafetyProfileSerializer implements ISafetyProfileSerializer {
  async serialize(safetyProfile: SafetyProfile): Promise<string> {
    return JSON.stringify(safetyProfile);
  }

  async deserialize(serialized: string): Promise<SafetyProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized safety profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<SafetyProfile>;
    return createSafetyProfile({
      safetyProfileId: parsed.safetyProfileId ?? "",
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

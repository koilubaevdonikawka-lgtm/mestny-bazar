import type { IComputeProfileSerializer } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-serializer.contract";
import {
  createComputeProfile,
  type ComputeProfile,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** JSON-based compute profile serializer. */
export class JsonComputeProfileSerializer implements IComputeProfileSerializer {
  async serialize(computeProfile: ComputeProfile): Promise<string> {
    return JSON.stringify(computeProfile);
  }

  async deserialize(serialized: string): Promise<ComputeProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized compute profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ComputeProfile>;
    return createComputeProfile({
      computeProfileId: parsed.computeProfileId ?? "",
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

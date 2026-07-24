import type { IAcceleratorProfileSerializer } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-serializer.contract";
import {
  createAcceleratorProfile,
  type AcceleratorProfile,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** JSON-based accelerator profile serializer. */
export class JsonAcceleratorProfileSerializer implements IAcceleratorProfileSerializer {
  async serialize(acceleratorProfile: AcceleratorProfile): Promise<string> {
    return JSON.stringify(acceleratorProfile);
  }

  async deserialize(serialized: string): Promise<AcceleratorProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized accelerator profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<AcceleratorProfile>;
    return createAcceleratorProfile({
      acceleratorProfileId: parsed.acceleratorProfileId ?? "",
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

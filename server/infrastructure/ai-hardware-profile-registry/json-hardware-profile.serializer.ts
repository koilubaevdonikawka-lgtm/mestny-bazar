import type { IHardwareProfileSerializer } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-serializer.contract";
import {
  createHardwareProfile,
  type HardwareProfile,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** JSON-based hardware profile serializer. */
export class JsonHardwareProfileSerializer implements IHardwareProfileSerializer {
  async serialize(hardwareProfile: HardwareProfile): Promise<string> {
    return JSON.stringify(hardwareProfile);
  }

  async deserialize(serialized: string): Promise<HardwareProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized hardware profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<HardwareProfile>;
    return createHardwareProfile({
      hardwareProfileId: parsed.hardwareProfileId ?? "",
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

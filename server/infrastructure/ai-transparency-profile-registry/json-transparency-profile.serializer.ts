import type { ITransparencyProfileSerializer } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-serializer.contract";
import {
  createTransparencyProfile,
  type TransparencyProfile,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** JSON-based transparency profile serializer. */
export class JsonTransparencyProfileSerializer implements ITransparencyProfileSerializer {
  async serialize(transparencyProfile: TransparencyProfile): Promise<string> {
    return JSON.stringify(transparencyProfile);
  }

  async deserialize(serialized: string): Promise<TransparencyProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized transparency profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<TransparencyProfile>;
    return createTransparencyProfile({
      transparencyProfileId: parsed.transparencyProfileId ?? "",
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

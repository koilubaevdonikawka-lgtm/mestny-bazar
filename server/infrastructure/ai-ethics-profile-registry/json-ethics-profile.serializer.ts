import type { IEthicsProfileSerializer } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-serializer.contract";
import {
  createEthicsProfile,
  type EthicsProfile,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** JSON-based ethics profile serializer. */
export class JsonEthicsProfileSerializer implements IEthicsProfileSerializer {
  async serialize(ethicsProfile: EthicsProfile): Promise<string> {
    return JSON.stringify(ethicsProfile);
  }

  async deserialize(serialized: string): Promise<EthicsProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized ethics profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<EthicsProfile>;
    return createEthicsProfile({
      ethicsProfileId: parsed.ethicsProfileId ?? "",
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

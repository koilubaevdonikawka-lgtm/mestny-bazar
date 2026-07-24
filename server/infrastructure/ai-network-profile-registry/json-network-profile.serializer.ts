import type { INetworkProfileSerializer } from "@server/application/ai-network-profile-registry/contracts/network-profile-serializer.contract";
import {
  createNetworkProfile,
  type NetworkProfile,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** JSON-based network profile serializer. */
export class JsonNetworkProfileSerializer implements INetworkProfileSerializer {
  async serialize(networkProfile: NetworkProfile): Promise<string> {
    return JSON.stringify(networkProfile);
  }

  async deserialize(serialized: string): Promise<NetworkProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized network profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<NetworkProfile>;
    return createNetworkProfile({
      networkProfileId: parsed.networkProfileId ?? "",
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

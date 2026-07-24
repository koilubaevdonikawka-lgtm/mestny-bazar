import type { IClusterProfileSerializer } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-serializer.contract";
import {
  createClusterProfile,
  type ClusterProfile,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** JSON-based cluster profile serializer. */
export class JsonClusterProfileSerializer implements IClusterProfileSerializer {
  async serialize(clusterProfile: ClusterProfile): Promise<string> {
    return JSON.stringify(clusterProfile);
  }

  async deserialize(serialized: string): Promise<ClusterProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized cluster profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ClusterProfile>;
    return createClusterProfile({
      clusterProfileId: parsed.clusterProfileId ?? "",
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

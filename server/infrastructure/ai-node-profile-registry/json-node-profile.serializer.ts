import type { INodeProfileSerializer } from "@server/application/ai-node-profile-registry/contracts/node-profile-serializer.contract";
import {
  createNodeProfile,
  type NodeProfile,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** JSON-based node profile serializer. */
export class JsonNodeProfileSerializer implements INodeProfileSerializer {
  async serialize(nodeProfile: NodeProfile): Promise<string> {
    return JSON.stringify(nodeProfile);
  }

  async deserialize(serialized: string): Promise<NodeProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized node profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<NodeProfile>;
    return createNodeProfile({
      nodeProfileId: parsed.nodeProfileId ?? "",
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

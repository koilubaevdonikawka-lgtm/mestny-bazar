import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

export interface INodeProfileSerializer {
  serialize(nodeProfile: NodeProfile): Promise<string>;
  deserialize(serialized: string): Promise<NodeProfile>;
}

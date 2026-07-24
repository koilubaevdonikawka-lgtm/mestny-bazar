import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

export interface INodeProfileCatalog {
  register(nodeProfile: NodeProfile): Promise<void>;
  remove(nodeProfileId: string): Promise<void>;
  findById(nodeProfileId: string): Promise<NodeProfile | null>;
  findByName(name: string): Promise<NodeProfile | null>;
  findByCategory(category: string): Promise<readonly NodeProfile[]>;
  listAll(): Promise<readonly NodeProfile[]>;
}

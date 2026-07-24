import type { NodeProfile } from "@server/application/ai-node-profile-registry/models/node-profile.model";

export interface INodeProfileRepository {
  save(nodeProfile: NodeProfile): Promise<void>;
  findById(nodeProfileId: string): Promise<NodeProfile | null>;
  findByName(name: string): Promise<NodeProfile | null>;
  findByCategory(category: string): Promise<readonly NodeProfile[]>;
  findAll(): Promise<readonly NodeProfile[]>;
  delete(nodeProfileId: string): Promise<boolean>;
}

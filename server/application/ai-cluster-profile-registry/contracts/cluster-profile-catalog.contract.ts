import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

export interface IClusterProfileCatalog {
  register(clusterProfile: ClusterProfile): Promise<void>;
  remove(clusterProfileId: string): Promise<void>;
  findById(clusterProfileId: string): Promise<ClusterProfile | null>;
  findByName(name: string): Promise<ClusterProfile | null>;
  findByCategory(category: string): Promise<readonly ClusterProfile[]>;
  listAll(): Promise<readonly ClusterProfile[]>;
}

import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

export interface IClusterProfileRepository {
  save(clusterProfile: ClusterProfile): Promise<void>;
  findById(clusterProfileId: string): Promise<ClusterProfile | null>;
  findByName(name: string): Promise<ClusterProfile | null>;
  findByCategory(category: string): Promise<readonly ClusterProfile[]>;
  findAll(): Promise<readonly ClusterProfile[]>;
  delete(clusterProfileId: string): Promise<boolean>;
}

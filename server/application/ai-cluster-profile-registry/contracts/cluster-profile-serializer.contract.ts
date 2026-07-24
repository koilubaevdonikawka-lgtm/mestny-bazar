import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

export interface IClusterProfileSerializer {
  serialize(clusterProfile: ClusterProfile): Promise<string>;
  deserialize(serialized: string): Promise<ClusterProfile>;
}

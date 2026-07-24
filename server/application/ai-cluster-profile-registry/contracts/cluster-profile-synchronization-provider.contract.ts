import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Future integration point for cluster profile synchronization. Not wired yet. */
export interface IClusterProfileSynchronizationProvider {
  synchronize(clusterProfiles: readonly ClusterProfile[]): Promise<void>;
}

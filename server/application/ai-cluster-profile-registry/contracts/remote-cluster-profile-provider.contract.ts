import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Future integration point for external cluster profile providers. Not wired yet. */
export interface IRemoteClusterProfileProvider {
  fetchRemote(clusterProfileId: string): Promise<ClusterProfile | null>;
  pushRemote(clusterProfile: ClusterProfile): Promise<void>;
}

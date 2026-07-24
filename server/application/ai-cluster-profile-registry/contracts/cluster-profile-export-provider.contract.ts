import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Future integration point for cluster profile export. Not wired yet. */
export interface IClusterProfileExportProvider {
  exportProfiles(clusterProfiles: readonly ClusterProfile[]): Promise<string>;
}

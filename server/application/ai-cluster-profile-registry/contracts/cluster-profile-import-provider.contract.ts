import type { ClusterProfile } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Future integration point for cluster profile import. Not wired yet. */
export interface IClusterProfileImportProvider {
  importProfiles(source: string): Promise<readonly ClusterProfile[]>;
}

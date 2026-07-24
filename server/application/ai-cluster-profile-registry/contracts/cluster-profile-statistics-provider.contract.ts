import type { ClusterProfileRegistryStatistics } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

export interface IClusterProfileStatisticsProvider {
  getStatistics(input: {
    totalClusterProfiles: number;
    activeClusterProfiles: number;
    categories: readonly string[];
  }): Promise<ClusterProfileRegistryStatistics>;
}

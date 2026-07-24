import type { IClusterProfileStatisticsProvider } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-statistics-provider.contract";
import type { ClusterProfileRegistryStatistics } from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

/** Default in-memory cluster profile statistics provider. */
export class DefaultClusterProfileStatisticsProvider implements IClusterProfileStatisticsProvider {
  async getStatistics(input: {
    totalClusterProfiles: number;
    activeClusterProfiles: number;
    categories: readonly string[];
  }): Promise<ClusterProfileRegistryStatistics> {
    return Object.freeze({
      totalClusterProfiles: input.totalClusterProfiles,
      activeClusterProfiles: input.activeClusterProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

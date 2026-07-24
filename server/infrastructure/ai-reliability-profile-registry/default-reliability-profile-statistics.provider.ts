import type { IReliabilityProfileStatisticsProvider } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-statistics-provider.contract";
import type { ReliabilityProfileRegistryStatistics } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Default in-memory reliability profile statistics provider. */
export class DefaultReliabilityProfileStatisticsProvider implements IReliabilityProfileStatisticsProvider {
  async getStatistics(input: {
    totalReliabilityProfiles: number;
    activeReliabilityProfiles: number;
    categories: readonly string[];
  }): Promise<ReliabilityProfileRegistryStatistics> {
    return Object.freeze({
      totalReliabilityProfiles: input.totalReliabilityProfiles,
      activeReliabilityProfiles: input.activeReliabilityProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

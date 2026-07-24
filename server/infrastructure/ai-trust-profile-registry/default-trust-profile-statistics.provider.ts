import type { ITrustProfileStatisticsProvider } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-statistics-provider.contract";
import type { TrustProfileRegistryStatistics } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Default in-memory trust profile statistics provider. */
export class DefaultTrustProfileStatisticsProvider implements ITrustProfileStatisticsProvider {
  async getStatistics(input: {
    totalTrustProfiles: number;
    activeTrustProfiles: number;
    categories: readonly string[];
  }): Promise<TrustProfileRegistryStatistics> {
    return Object.freeze({
      totalTrustProfiles: input.totalTrustProfiles,
      activeTrustProfiles: input.activeTrustProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IAccountabilityProfileStatisticsProvider } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-statistics-provider.contract";
import type { AccountabilityProfileRegistryStatistics } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Default in-memory accountability profile statistics provider. */
export class DefaultAccountabilityProfileStatisticsProvider implements IAccountabilityProfileStatisticsProvider {
  async getStatistics(input: {
    totalAccountabilityProfiles: number;
    activeAccountabilityProfiles: number;
    categories: readonly string[];
  }): Promise<AccountabilityProfileRegistryStatistics> {
    return Object.freeze({
      totalAccountabilityProfiles: input.totalAccountabilityProfiles,
      activeAccountabilityProfiles: input.activeAccountabilityProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

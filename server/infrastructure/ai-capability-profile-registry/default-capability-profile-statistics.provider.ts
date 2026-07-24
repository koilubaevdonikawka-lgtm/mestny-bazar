import type { ICapabilityProfileStatisticsProvider } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-statistics-provider.contract";
import type { CapabilityProfileRegistryStatistics } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Default in-memory capability profile statistics provider. */
export class DefaultCapabilityProfileStatisticsProvider implements ICapabilityProfileStatisticsProvider {
  async getStatistics(input: {
    totalCapabilityProfiles: number;
    activeCapabilityProfiles: number;
    categories: readonly string[];
  }): Promise<CapabilityProfileRegistryStatistics> {
    return Object.freeze({
      totalCapabilityProfiles: input.totalCapabilityProfiles,
      activeCapabilityProfiles: input.activeCapabilityProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

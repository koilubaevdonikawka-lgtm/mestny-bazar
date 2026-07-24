import type { ISafetyProfileStatisticsProvider } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-statistics-provider.contract";
import type { SafetyProfileRegistryStatistics } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

/** Default in-memory safety profile statistics provider. */
export class DefaultSafetyProfileStatisticsProvider implements ISafetyProfileStatisticsProvider {
  async getStatistics(input: {
    totalSafetyProfiles: number;
    activeSafetyProfiles: number;
    categories: readonly string[];
  }): Promise<SafetyProfileRegistryStatistics> {
    return Object.freeze({
      totalSafetyProfiles: input.totalSafetyProfiles,
      activeSafetyProfiles: input.activeSafetyProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IPrivacyProfileStatisticsProvider } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-statistics-provider.contract";
import type { PrivacyProfileRegistryStatistics } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Default in-memory privacy profile statistics provider. */
export class DefaultPrivacyProfileStatisticsProvider implements IPrivacyProfileStatisticsProvider {
  async getStatistics(input: {
    totalPrivacyProfiles: number;
    activePrivacyProfiles: number;
    categories: readonly string[];
  }): Promise<PrivacyProfileRegistryStatistics> {
    return Object.freeze({
      totalPrivacyProfiles: input.totalPrivacyProfiles,
      activePrivacyProfiles: input.activePrivacyProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

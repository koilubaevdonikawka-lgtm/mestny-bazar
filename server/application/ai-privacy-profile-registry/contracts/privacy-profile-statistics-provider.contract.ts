import type { PrivacyProfileRegistryStatistics } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

export interface IPrivacyProfileStatisticsProvider {
  getStatistics(input: {
    totalPrivacyProfiles: number;
    activePrivacyProfiles: number;
    categories: readonly string[];
  }): Promise<PrivacyProfileRegistryStatistics>;
}

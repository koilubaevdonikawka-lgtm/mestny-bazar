import type { AccountabilityProfileRegistryStatistics } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

export interface IAccountabilityProfileStatisticsProvider {
  getStatistics(input: {
    totalAccountabilityProfiles: number;
    activeAccountabilityProfiles: number;
    categories: readonly string[];
  }): Promise<AccountabilityProfileRegistryStatistics>;
}

import type { ProfileRegistryStatistics } from "@server/application/ai-profile-registry/models/profile.model";

export interface IProfileStatisticsProvider {
  getStatistics(input: {
    totalProfiles: number;
    activeProfiles: number;
    types: readonly string[];
  }): Promise<ProfileRegistryStatistics>;
}

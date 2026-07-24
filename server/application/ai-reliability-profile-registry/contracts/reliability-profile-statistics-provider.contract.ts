import type { ReliabilityProfileRegistryStatistics } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

export interface IReliabilityProfileStatisticsProvider {
  getStatistics(input: {
    totalReliabilityProfiles: number;
    activeReliabilityProfiles: number;
    categories: readonly string[];
  }): Promise<ReliabilityProfileRegistryStatistics>;
}

import type { SafetyProfileRegistryStatistics } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

export interface ISafetyProfileStatisticsProvider {
  getStatistics(input: {
    totalSafetyProfiles: number;
    activeSafetyProfiles: number;
    categories: readonly string[];
  }): Promise<SafetyProfileRegistryStatistics>;
}

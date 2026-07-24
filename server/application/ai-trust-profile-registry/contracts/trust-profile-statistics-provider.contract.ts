import type { TrustProfileRegistryStatistics } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

export interface ITrustProfileStatisticsProvider {
  getStatistics(input: {
    totalTrustProfiles: number;
    activeTrustProfiles: number;
    categories: readonly string[];
  }): Promise<TrustProfileRegistryStatistics>;
}

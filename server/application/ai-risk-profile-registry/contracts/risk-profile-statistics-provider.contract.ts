import type { RiskProfileRegistryStatistics } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

export interface IRiskProfileStatisticsProvider {
  getStatistics(input: {
    totalRiskProfiles: number;
    activeRiskProfiles: number;
    categories: readonly string[];
  }): Promise<RiskProfileRegistryStatistics>;
}

import type { IRiskProfileStatisticsProvider } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-statistics-provider.contract";
import type { RiskProfileRegistryStatistics } from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** Default in-memory risk profile statistics provider. */
export class DefaultRiskProfileStatisticsProvider implements IRiskProfileStatisticsProvider {
  async getStatistics(input: {
    totalRiskProfiles: number;
    activeRiskProfiles: number;
    categories: readonly string[];
  }): Promise<RiskProfileRegistryStatistics> {
    return Object.freeze({
      totalRiskProfiles: input.totalRiskProfiles,
      activeRiskProfiles: input.activeRiskProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

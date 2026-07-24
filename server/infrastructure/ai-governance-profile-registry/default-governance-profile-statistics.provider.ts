import type { IGovernanceProfileStatisticsProvider } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-statistics-provider.contract";
import type { GovernanceProfileRegistryStatistics } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Default in-memory governance profile statistics provider. */
export class DefaultGovernanceProfileStatisticsProvider implements IGovernanceProfileStatisticsProvider {
  async getStatistics(input: {
    totalGovernanceProfiles: number;
    activeGovernanceProfiles: number;
    categories: readonly string[];
  }): Promise<GovernanceProfileRegistryStatistics> {
    return Object.freeze({
      totalGovernanceProfiles: input.totalGovernanceProfiles,
      activeGovernanceProfiles: input.activeGovernanceProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

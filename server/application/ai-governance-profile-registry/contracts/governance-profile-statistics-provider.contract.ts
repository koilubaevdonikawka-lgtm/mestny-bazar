import type { GovernanceProfileRegistryStatistics } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

export interface IGovernanceProfileStatisticsProvider {
  getStatistics(input: {
    totalGovernanceProfiles: number;
    activeGovernanceProfiles: number;
    categories: readonly string[];
  }): Promise<GovernanceProfileRegistryStatistics>;
}

import type { GovernancePolicyRegistryStatistics } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

export interface IGovernancePolicyStatisticsProvider {
  getStatistics(input: {
    totalGovernancePolicies: number;
    activeGovernancePolicies: number;
    categories: readonly string[];
  }): Promise<GovernancePolicyRegistryStatistics>;
}

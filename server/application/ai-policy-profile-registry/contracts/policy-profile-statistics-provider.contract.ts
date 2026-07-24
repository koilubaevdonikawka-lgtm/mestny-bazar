import type { PolicyProfileRegistryStatistics } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

export interface IPolicyProfileStatisticsProvider {
  getStatistics(input: {
    totalPolicyProfiles: number;
    activePolicyProfiles: number;
    categories: readonly string[];
  }): Promise<PolicyProfileRegistryStatistics>;
}

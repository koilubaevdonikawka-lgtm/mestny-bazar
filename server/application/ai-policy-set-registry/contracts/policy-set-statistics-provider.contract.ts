import type { PolicySetRegistryStatistics } from "@server/application/ai-policy-set-registry/models/policy-set.model";

export interface IPolicySetStatisticsProvider {
  getStatistics(input: {
    totalPolicySets: number;
    activePolicySets: number;
    categories: readonly string[];
  }): Promise<PolicySetRegistryStatistics>;
}

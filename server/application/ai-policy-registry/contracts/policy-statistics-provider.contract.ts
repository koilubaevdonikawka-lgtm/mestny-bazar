import type { PolicyRegistryStatistics } from "@server/application/ai-policy-registry/models/policy.model";

export interface IPolicyStatisticsProvider {
  getStatistics(input: {
    totalPolicies: number;
    activePolicies: number;
    categories: readonly string[];
  }): Promise<PolicyRegistryStatistics>;
}

import type { IPolicyStatisticsProvider } from "@server/application/ai-policy-registry/contracts/policy-statistics-provider.contract";
import type { PolicyRegistryStatistics } from "@server/application/ai-policy-registry/models/policy.model";

/** Default in-memory policy statistics provider. */
export class DefaultPolicyStatisticsProvider implements IPolicyStatisticsProvider {
  async getStatistics(input: {
    totalPolicies: number;
    activePolicies: number;
    categories: readonly string[];
  }): Promise<PolicyRegistryStatistics> {
    return Object.freeze({
      totalPolicies: input.totalPolicies,
      activePolicies: input.activePolicies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

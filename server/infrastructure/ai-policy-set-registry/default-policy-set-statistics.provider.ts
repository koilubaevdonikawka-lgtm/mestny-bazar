import type { IPolicySetStatisticsProvider } from "@server/application/ai-policy-set-registry/contracts/policy-set-statistics-provider.contract";
import type { PolicySetRegistryStatistics } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Default in-memory policy set statistics provider. */
export class DefaultPolicySetStatisticsProvider implements IPolicySetStatisticsProvider {
  async getStatistics(input: {
    totalPolicySets: number;
    activePolicySets: number;
    categories: readonly string[];
  }): Promise<PolicySetRegistryStatistics> {
    return Object.freeze({
      totalPolicySets: input.totalPolicySets,
      activePolicySets: input.activePolicySets,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IGovernancePolicyStatisticsProvider } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-statistics-provider.contract";
import type { GovernancePolicyRegistryStatistics } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Default in-memory governance policy statistics provider. */
export class DefaultGovernancePolicyStatisticsProvider implements IGovernancePolicyStatisticsProvider {
  async getStatistics(input: {
    totalGovernancePolicies: number;
    activeGovernancePolicies: number;
    categories: readonly string[];
  }): Promise<GovernancePolicyRegistryStatistics> {
    return Object.freeze({
      totalGovernancePolicies: input.totalGovernancePolicies,
      activeGovernancePolicies: input.activeGovernancePolicies,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IPolicyProfileStatisticsProvider } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-statistics-provider.contract";
import type { PolicyProfileRegistryStatistics } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** Default in-memory policy profile statistics provider. */
export class DefaultPolicyProfileStatisticsProvider implements IPolicyProfileStatisticsProvider {
  async getStatistics(input: {
    totalPolicyProfiles: number;
    activePolicyProfiles: number;
    categories: readonly string[];
  }): Promise<PolicyProfileRegistryStatistics> {
    return Object.freeze({
      totalPolicyProfiles: input.totalPolicyProfiles,
      activePolicyProfiles: input.activePolicyProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

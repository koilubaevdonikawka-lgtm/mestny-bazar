import type { IFairnessProfileStatisticsProvider } from "@server/application/ai-fairness-profile-registry/contracts/fairness-profile-statistics-provider.contract";
import type { FairnessProfileRegistryStatistics } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Default in-memory fairness profile statistics provider. */
export class DefaultFairnessProfileStatisticsProvider implements IFairnessProfileStatisticsProvider {
  async getStatistics(input: {
    totalFairnessProfiles: number;
    activeFairnessProfiles: number;
    categories: readonly string[];
  }): Promise<FairnessProfileRegistryStatistics> {
    return Object.freeze({
      totalFairnessProfiles: input.totalFairnessProfiles,
      activeFairnessProfiles: input.activeFairnessProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

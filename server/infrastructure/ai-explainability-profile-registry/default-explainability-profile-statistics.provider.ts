import type { IExplainabilityProfileStatisticsProvider } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-statistics-provider.contract";
import type { ExplainabilityProfileRegistryStatistics } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** Default in-memory explainability profile statistics provider. */
export class DefaultExplainabilityProfileStatisticsProvider implements IExplainabilityProfileStatisticsProvider {
  async getStatistics(input: {
    totalExplainabilityProfiles: number;
    activeExplainabilityProfiles: number;
    categories: readonly string[];
  }): Promise<ExplainabilityProfileRegistryStatistics> {
    return Object.freeze({
      totalExplainabilityProfiles: input.totalExplainabilityProfiles,
      activeExplainabilityProfiles: input.activeExplainabilityProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

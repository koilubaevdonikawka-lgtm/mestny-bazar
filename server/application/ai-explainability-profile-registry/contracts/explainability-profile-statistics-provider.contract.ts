import type { ExplainabilityProfileRegistryStatistics } from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

export interface IExplainabilityProfileStatisticsProvider {
  getStatistics(input: {
    totalExplainabilityProfiles: number;
    activeExplainabilityProfiles: number;
    categories: readonly string[];
  }): Promise<ExplainabilityProfileRegistryStatistics>;
}

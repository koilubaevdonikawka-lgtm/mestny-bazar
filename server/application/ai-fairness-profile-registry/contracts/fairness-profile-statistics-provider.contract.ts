import type { FairnessProfileRegistryStatistics } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

export interface IFairnessProfileStatisticsProvider {
  getStatistics(input: {
    totalFairnessProfiles: number;
    activeFairnessProfiles: number;
    categories: readonly string[];
  }): Promise<FairnessProfileRegistryStatistics>;
}

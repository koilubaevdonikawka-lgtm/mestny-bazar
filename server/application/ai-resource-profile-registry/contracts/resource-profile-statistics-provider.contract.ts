import type { ResourceProfileRegistryStatistics } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

export interface IResourceProfileStatisticsProvider {
  getStatistics(input: {
    totalResourceProfiles: number;
    activeResourceProfiles: number;
    categories: readonly string[];
  }): Promise<ResourceProfileRegistryStatistics>;
}

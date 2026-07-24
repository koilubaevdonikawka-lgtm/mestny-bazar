import type { IResourceProfileStatisticsProvider } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-statistics-provider.contract";
import type { ResourceProfileRegistryStatistics } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Default in-memory resource profile statistics provider. */
export class DefaultResourceProfileStatisticsProvider implements IResourceProfileStatisticsProvider {
  async getStatistics(input: {
    totalResourceProfiles: number;
    activeResourceProfiles: number;
    categories: readonly string[];
  }): Promise<ResourceProfileRegistryStatistics> {
    return Object.freeze({
      totalResourceProfiles: input.totalResourceProfiles,
      activeResourceProfiles: input.activeResourceProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IServiceProfileStatisticsProvider } from "@server/application/ai-service-profile-registry/contracts/service-profile-statistics-provider.contract";
import type { ServiceProfileRegistryStatistics } from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Default in-memory service profile statistics provider. */
export class DefaultServiceProfileStatisticsProvider implements IServiceProfileStatisticsProvider {
  async getStatistics(input: {
    totalServiceProfiles: number;
    activeServiceProfiles: number;
    categories: readonly string[];
  }): Promise<ServiceProfileRegistryStatistics> {
    return Object.freeze({
      totalServiceProfiles: input.totalServiceProfiles,
      activeServiceProfiles: input.activeServiceProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { IEnvironmentProfileStatisticsProvider } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-statistics-provider.contract";
import type { EnvironmentProfileRegistryStatistics } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Default in-memory environment profile statistics provider. */
export class DefaultEnvironmentProfileStatisticsProvider implements IEnvironmentProfileStatisticsProvider {
  async getStatistics(input: {
    totalEnvironmentProfiles: number;
    activeEnvironmentProfiles: number;
    categories: readonly string[];
  }): Promise<EnvironmentProfileRegistryStatistics> {
    return Object.freeze({
      totalEnvironmentProfiles: input.totalEnvironmentProfiles,
      activeEnvironmentProfiles: input.activeEnvironmentProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

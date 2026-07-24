import type { IRuntimeProfileStatisticsProvider } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-statistics-provider.contract";
import type { RuntimeProfileRegistryStatistics } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Default in-memory runtime profile statistics provider. */
export class DefaultRuntimeProfileStatisticsProvider implements IRuntimeProfileStatisticsProvider {
  async getStatistics(input: {
    totalRuntimeProfiles: number;
    activeRuntimeProfiles: number;
    categories: readonly string[];
  }): Promise<RuntimeProfileRegistryStatistics> {
    return Object.freeze({
      totalRuntimeProfiles: input.totalRuntimeProfiles,
      activeRuntimeProfiles: input.activeRuntimeProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

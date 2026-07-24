import type { IMemoryProfileStatisticsProvider } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-statistics-provider.contract";
import type { MemoryProfileRegistryStatistics } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

/** Default in-memory memory profile statistics provider. */
export class DefaultMemoryProfileStatisticsProvider implements IMemoryProfileStatisticsProvider {
  async getStatistics(input: {
    totalMemoryProfiles: number;
    activeMemoryProfiles: number;
    categories: readonly string[];
  }): Promise<MemoryProfileRegistryStatistics> {
    return Object.freeze({
      totalMemoryProfiles: input.totalMemoryProfiles,
      activeMemoryProfiles: input.activeMemoryProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

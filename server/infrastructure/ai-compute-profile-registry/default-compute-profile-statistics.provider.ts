import type { IComputeProfileStatisticsProvider } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-statistics-provider.contract";
import type { ComputeProfileRegistryStatistics } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

/** Default in-memory compute profile statistics provider. */
export class DefaultComputeProfileStatisticsProvider implements IComputeProfileStatisticsProvider {
  async getStatistics(input: {
    totalComputeProfiles: number;
    activeComputeProfiles: number;
    categories: readonly string[];
  }): Promise<ComputeProfileRegistryStatistics> {
    return Object.freeze({
      totalComputeProfiles: input.totalComputeProfiles,
      activeComputeProfiles: input.activeComputeProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

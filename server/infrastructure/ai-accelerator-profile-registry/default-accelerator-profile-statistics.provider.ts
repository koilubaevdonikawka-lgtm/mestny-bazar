import type { IAcceleratorProfileStatisticsProvider } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-statistics-provider.contract";
import type { AcceleratorProfileRegistryStatistics } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

/** Default in-memory accelerator profile statistics provider. */
export class DefaultAcceleratorProfileStatisticsProvider implements IAcceleratorProfileStatisticsProvider {
  async getStatistics(input: {
    totalAcceleratorProfiles: number;
    activeAcceleratorProfiles: number;
    categories: readonly string[];
  }): Promise<AcceleratorProfileRegistryStatistics> {
    return Object.freeze({
      totalAcceleratorProfiles: input.totalAcceleratorProfiles,
      activeAcceleratorProfiles: input.activeAcceleratorProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

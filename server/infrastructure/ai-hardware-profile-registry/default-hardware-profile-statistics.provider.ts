import type { IHardwareProfileStatisticsProvider } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-statistics-provider.contract";
import type { HardwareProfileRegistryStatistics } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

/** Default in-memory hardware profile statistics provider. */
export class DefaultHardwareProfileStatisticsProvider implements IHardwareProfileStatisticsProvider {
  async getStatistics(input: {
    totalHardwareProfiles: number;
    activeHardwareProfiles: number;
    categories: readonly string[];
  }): Promise<HardwareProfileRegistryStatistics> {
    return Object.freeze({
      totalHardwareProfiles: input.totalHardwareProfiles,
      activeHardwareProfiles: input.activeHardwareProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

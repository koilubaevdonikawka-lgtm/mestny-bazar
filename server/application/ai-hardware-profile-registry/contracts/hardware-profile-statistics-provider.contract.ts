import type { HardwareProfileRegistryStatistics } from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

export interface IHardwareProfileStatisticsProvider {
  getStatistics(input: {
    totalHardwareProfiles: number;
    activeHardwareProfiles: number;
    categories: readonly string[];
  }): Promise<HardwareProfileRegistryStatistics>;
}

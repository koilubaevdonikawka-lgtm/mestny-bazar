import type { AcceleratorProfileRegistryStatistics } from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";

export interface IAcceleratorProfileStatisticsProvider {
  getStatistics(input: {
    totalAcceleratorProfiles: number;
    activeAcceleratorProfiles: number;
    categories: readonly string[];
  }): Promise<AcceleratorProfileRegistryStatistics>;
}

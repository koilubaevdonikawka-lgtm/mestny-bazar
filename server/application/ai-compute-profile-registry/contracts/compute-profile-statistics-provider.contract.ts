import type { ComputeProfileRegistryStatistics } from "@server/application/ai-compute-profile-registry/models/compute-profile.model";

export interface IComputeProfileStatisticsProvider {
  getStatistics(input: {
    totalComputeProfiles: number;
    activeComputeProfiles: number;
    categories: readonly string[];
  }): Promise<ComputeProfileRegistryStatistics>;
}

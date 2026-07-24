import type { MemoryProfileRegistryStatistics } from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

export interface IMemoryProfileStatisticsProvider {
  getStatistics(input: {
    totalMemoryProfiles: number;
    activeMemoryProfiles: number;
    categories: readonly string[];
  }): Promise<MemoryProfileRegistryStatistics>;
}

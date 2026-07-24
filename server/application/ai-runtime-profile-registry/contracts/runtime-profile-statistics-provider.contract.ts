import type { RuntimeProfileRegistryStatistics } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

export interface IRuntimeProfileStatisticsProvider {
  getStatistics(input: {
    totalRuntimeProfiles: number;
    activeRuntimeProfiles: number;
    categories: readonly string[];
  }): Promise<RuntimeProfileRegistryStatistics>;
}

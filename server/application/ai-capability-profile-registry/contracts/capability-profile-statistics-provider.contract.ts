import type { CapabilityProfileRegistryStatistics } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

export interface ICapabilityProfileStatisticsProvider {
  getStatistics(input: {
    totalCapabilityProfiles: number;
    activeCapabilityProfiles: number;
    categories: readonly string[];
  }): Promise<CapabilityProfileRegistryStatistics>;
}

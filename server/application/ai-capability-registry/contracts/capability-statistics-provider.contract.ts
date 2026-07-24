import type { CapabilityRegistryStatistics } from "@server/application/ai-capability-registry/models/capability.model";

export interface ICapabilityStatisticsProvider {
  getStatistics(input: {
    totalCapabilities: number;
    activeCapabilities: number;
    categories: readonly string[];
  }): Promise<CapabilityRegistryStatistics>;
}

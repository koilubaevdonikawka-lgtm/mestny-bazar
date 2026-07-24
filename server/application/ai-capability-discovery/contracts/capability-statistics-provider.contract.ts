import type { CapabilityStatistics } from "@server/application/ai-capability-discovery/models/capability.model";

export interface ICapabilityStatisticsProvider {
  getStatistics(input: {
    totalCapabilities: number;
    totalCategories: number;
    activeCapabilities: number;
    inactiveCapabilities: number;
  }): Promise<CapabilityStatistics>;
}

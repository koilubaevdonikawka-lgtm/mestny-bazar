import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-discovery/contracts/capability-statistics-provider.contract";
import type { CapabilityStatistics } from "@server/application/ai-capability-discovery/models/capability.model";

/** Default in-memory capability statistics provider. */
export class DefaultCapabilityStatisticsProvider implements ICapabilityStatisticsProvider {
  async getStatistics(input: {
    totalCapabilities: number;
    totalCategories: number;
    activeCapabilities: number;
    inactiveCapabilities: number;
  }): Promise<CapabilityStatistics> {
    return Object.freeze({
      totalCapabilities: input.totalCapabilities,
      totalCategories: input.totalCategories,
      activeCapabilities: input.activeCapabilities,
      inactiveCapabilities: input.inactiveCapabilities,
    });
  }
}

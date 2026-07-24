import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-registry/contracts/capability-statistics-provider.contract";
import type { CapabilityRegistryStatistics } from "@server/application/ai-capability-registry/models/capability.model";

/** Default in-memory capability statistics provider. */
export class DefaultCapabilityStatisticsProvider implements ICapabilityStatisticsProvider {
  async getStatistics(input: {
    totalCapabilities: number;
    activeCapabilities: number;
    categories: readonly string[];
  }): Promise<CapabilityRegistryStatistics> {
    return Object.freeze({
      totalCapabilities: input.totalCapabilities,
      activeCapabilities: input.activeCapabilities,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

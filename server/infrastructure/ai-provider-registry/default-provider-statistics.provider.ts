import type { IProviderStatisticsProvider } from "@server/application/ai-provider-registry/contracts/provider-statistics-provider.contract";
import type { ProviderRegistryStatistics } from "@server/application/ai-provider-registry/models/provider.model";

/** Default in-memory provider statistics provider. */
export class DefaultProviderStatisticsProvider implements IProviderStatisticsProvider {
  async getStatistics(input: {
    totalProviders: number;
    activeProviders: number;
    types: readonly string[];
  }): Promise<ProviderRegistryStatistics> {
    return Object.freeze({
      totalProviders: input.totalProviders,
      activeProviders: input.activeProviders,
      typeCount: input.types.length,
      types: Object.freeze([...input.types]),
    });
  }
}

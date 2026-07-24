import type { ProviderRegistryStatistics } from "@server/application/ai-provider-registry/models/provider.model";

export interface IProviderStatisticsProvider {
  getStatistics(input: {
    totalProviders: number;
    activeProviders: number;
    types: readonly string[];
  }): Promise<ProviderRegistryStatistics>;
}

import type { IResourcePoolStatisticsProvider } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-statistics-provider.contract";
import type { ResourcePoolRegistryStatistics } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

/** Default in-memory resource pool statistics provider. */
export class DefaultResourcePoolStatisticsProvider implements IResourcePoolStatisticsProvider {
  async getStatistics(input: {
    totalResourcePools: number;
    activeResourcePools: number;
    categories: readonly string[];
  }): Promise<ResourcePoolRegistryStatistics> {
    return Object.freeze({
      totalResourcePools: input.totalResourcePools,
      activeResourcePools: input.activeResourcePools,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

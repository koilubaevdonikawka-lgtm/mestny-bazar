import type { ResourcePoolRegistryStatistics } from "@server/application/ai-resource-pool-registry/models/resource-pool.model";

export interface IResourcePoolStatisticsProvider {
  getStatistics(input: {
    totalResourcePools: number;
    activeResourcePools: number;
    categories: readonly string[];
  }): Promise<ResourcePoolRegistryStatistics>;
}

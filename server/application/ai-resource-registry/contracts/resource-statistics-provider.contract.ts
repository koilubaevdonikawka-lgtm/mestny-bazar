import type { ResourceRegistryStatistics } from "@server/application/ai-resource-registry/models/resource.model";

export interface IResourceStatisticsProvider {
  getStatistics(input: {
    totalResources: number;
    activeResources: number;
    types: readonly string[];
  }): Promise<ResourceRegistryStatistics>;
}

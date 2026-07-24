import type { IResourceStatisticsProvider } from "@server/application/ai-resource-registry/contracts/resource-statistics-provider.contract";
import type { ResourceRegistryStatistics } from "@server/application/ai-resource-registry/models/resource.model";

/** Default in-memory resource statistics provider. */
export class DefaultResourceStatisticsProvider implements IResourceStatisticsProvider {
  async getStatistics(input: {
    totalResources: number;
    activeResources: number;
    types: readonly string[];
  }): Promise<ResourceRegistryStatistics> {
    return Object.freeze({
      totalResources: input.totalResources,
      activeResources: input.activeResources,
      typeCount: input.types.length,
      types: Object.freeze([...input.types]),
    });
  }
}

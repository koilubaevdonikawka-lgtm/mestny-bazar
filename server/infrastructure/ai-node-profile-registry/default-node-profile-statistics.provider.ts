import type { INodeProfileStatisticsProvider } from "@server/application/ai-node-profile-registry/contracts/node-profile-statistics-provider.contract";
import type { NodeProfileRegistryStatistics } from "@server/application/ai-node-profile-registry/models/node-profile.model";

/** Default in-memory node profile statistics provider. */
export class DefaultNodeProfileStatisticsProvider implements INodeProfileStatisticsProvider {
  async getStatistics(input: {
    totalNodeProfiles: number;
    activeNodeProfiles: number;
    categories: readonly string[];
  }): Promise<NodeProfileRegistryStatistics> {
    return Object.freeze({
      totalNodeProfiles: input.totalNodeProfiles,
      activeNodeProfiles: input.activeNodeProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

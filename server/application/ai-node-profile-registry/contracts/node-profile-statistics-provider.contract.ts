import type { NodeProfileRegistryStatistics } from "@server/application/ai-node-profile-registry/models/node-profile.model";

export interface INodeProfileStatisticsProvider {
  getStatistics(input: {
    totalNodeProfiles: number;
    activeNodeProfiles: number;
    categories: readonly string[];
  }): Promise<NodeProfileRegistryStatistics>;
}

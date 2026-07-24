import type { GraphRegistryStatistics } from "@server/application/ai-graph-registry/models/graph.model";

export interface IGraphStatisticsProvider {
  getStatistics(input: {
    totalGraphs: number;
    activeGraphs: number;
    categories: readonly string[];
  }): Promise<GraphRegistryStatistics>;
}

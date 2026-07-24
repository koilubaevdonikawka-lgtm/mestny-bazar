import type { IGraphStatisticsProvider } from "@server/application/ai-graph-registry/contracts/graph-statistics-provider.contract";
import type { GraphRegistryStatistics } from "@server/application/ai-graph-registry/models/graph.model";

/** Default in-memory graph statistics provider. */
export class DefaultGraphStatisticsProvider implements IGraphStatisticsProvider {
  async getStatistics(input: {
    totalGraphs: number;
    activeGraphs: number;
    categories: readonly string[];
  }): Promise<GraphRegistryStatistics> {
    return Object.freeze({
      totalGraphs: input.totalGraphs,
      activeGraphs: input.activeGraphs,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

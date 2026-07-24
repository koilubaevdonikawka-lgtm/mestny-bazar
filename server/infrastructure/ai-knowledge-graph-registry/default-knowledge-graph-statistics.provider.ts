import type { IKnowledgeGraphStatisticsProvider } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-statistics-provider.contract";
import type { KnowledgeGraphRegistryStatistics } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** Default in-memory knowledge graph statistics provider. */
export class DefaultKnowledgeGraphStatisticsProvider implements IKnowledgeGraphStatisticsProvider {
  async getStatistics(input: {
    totalKnowledgeGraphs: number;
    activeKnowledgeGraphs: number;
    categories: readonly string[];
  }): Promise<KnowledgeGraphRegistryStatistics> {
    return Object.freeze({
      totalKnowledgeGraphs: input.totalKnowledgeGraphs,
      activeKnowledgeGraphs: input.activeKnowledgeGraphs,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

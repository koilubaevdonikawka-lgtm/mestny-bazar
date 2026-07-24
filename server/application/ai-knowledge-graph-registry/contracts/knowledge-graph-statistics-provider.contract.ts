import type { KnowledgeGraphRegistryStatistics } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

export interface IKnowledgeGraphStatisticsProvider {
  getStatistics(input: {
    totalKnowledgeGraphs: number;
    activeKnowledgeGraphs: number;
    categories: readonly string[];
  }): Promise<KnowledgeGraphRegistryStatistics>;
}

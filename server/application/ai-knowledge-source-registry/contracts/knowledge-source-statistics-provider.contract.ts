import type { KnowledgeSourceRegistryStatistics } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

export interface IKnowledgeSourceStatisticsProvider {
  getStatistics(input: {
    totalKnowledgeSources: number;
    activeKnowledgeSources: number;
    categories: readonly string[];
  }): Promise<KnowledgeSourceRegistryStatistics>;
}

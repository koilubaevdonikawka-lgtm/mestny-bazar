import type { KnowledgeRegistryStatistics } from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

export interface IKnowledgeStatisticsProvider {
  getStatistics(input: {
    totalSources: number;
    activeSources: number;
    categories: readonly string[];
  }): Promise<KnowledgeRegistryStatistics>;
}

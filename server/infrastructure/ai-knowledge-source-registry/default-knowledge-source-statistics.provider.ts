import type { IKnowledgeSourceStatisticsProvider } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-statistics-provider.contract";
import type { KnowledgeSourceRegistryStatistics } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Default in-memory knowledge source statistics provider. */
export class DefaultKnowledgeSourceStatisticsProvider implements IKnowledgeSourceStatisticsProvider {
  async getStatistics(input: {
    totalKnowledgeSources: number;
    activeKnowledgeSources: number;
    categories: readonly string[];
  }): Promise<KnowledgeSourceRegistryStatistics> {
    return Object.freeze({
      totalKnowledgeSources: input.totalKnowledgeSources,
      activeKnowledgeSources: input.activeKnowledgeSources,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

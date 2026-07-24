import type { IKnowledgeStatisticsProvider } from "@server/application/ai-knowledge-registry/contracts/knowledge-statistics-provider.contract";
import type { KnowledgeRegistryStatistics } from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

/** Default in-memory knowledge registry statistics provider. */
export class DefaultKnowledgeStatisticsProvider implements IKnowledgeStatisticsProvider {
  async getStatistics(input: {
    totalSources: number;
    activeSources: number;
    categories: readonly string[];
  }): Promise<KnowledgeRegistryStatistics> {
    return Object.freeze({
      totalSources: input.totalSources,
      activeSources: input.activeSources,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

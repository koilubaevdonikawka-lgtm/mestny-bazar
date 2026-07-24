import type { IKnowledgePackageStatisticsProvider } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-statistics-provider.contract";
import type { KnowledgePackageRegistryStatistics } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Default in-memory knowledge package statistics provider. */
export class DefaultKnowledgePackageStatisticsProvider implements IKnowledgePackageStatisticsProvider {
  async getStatistics(input: {
    totalKnowledgePackages: number;
    activeKnowledgePackages: number;
    categories: readonly string[];
  }): Promise<KnowledgePackageRegistryStatistics> {
    return Object.freeze({
      totalKnowledgePackages: input.totalKnowledgePackages,
      activeKnowledgePackages: input.activeKnowledgePackages,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

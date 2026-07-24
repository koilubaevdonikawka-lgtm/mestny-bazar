import type { KnowledgePackageRegistryStatistics } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

export interface IKnowledgePackageStatisticsProvider {
  getStatistics(input: {
    totalKnowledgePackages: number;
    activeKnowledgePackages: number;
    categories: readonly string[];
  }): Promise<KnowledgePackageRegistryStatistics>;
}

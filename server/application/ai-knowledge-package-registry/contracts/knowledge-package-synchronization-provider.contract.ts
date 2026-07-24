import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Future integration point for knowledge package synchronization. Not wired yet. */
export interface IKnowledgePackageSynchronizationProvider {
  synchronize(knowledgePackages: readonly KnowledgePackage[]): Promise<void>;
}

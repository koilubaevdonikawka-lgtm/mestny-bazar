import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Future integration point for external knowledge package providers. Not wired yet. */
export interface IRemoteKnowledgePackageProvider {
  fetchRemote(knowledgePackageId: string): Promise<KnowledgePackage | null>;
  pushRemote(knowledgePackage: KnowledgePackage): Promise<void>;
}

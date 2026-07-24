import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Future integration point for knowledge package version management. Not wired yet. */
export interface IKnowledgePackageVersionProvider {
  listVersions(knowledgePackageId: string): Promise<readonly KnowledgePackage[]>;
  getVersion(knowledgePackageId: string, version: string): Promise<KnowledgePackage | null>;
}

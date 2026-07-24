import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Future integration point for knowledge package import. Not wired yet. */
export interface IKnowledgePackageImportProvider {
  importFrom(source: string): Promise<readonly KnowledgePackage[]>;
}

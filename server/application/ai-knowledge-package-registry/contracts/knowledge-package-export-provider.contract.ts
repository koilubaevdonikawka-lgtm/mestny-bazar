import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Future integration point for knowledge package export. Not wired yet. */
export interface IKnowledgePackageExportProvider {
  exportTo(knowledgePackages: readonly KnowledgePackage[]): Promise<string>;
}

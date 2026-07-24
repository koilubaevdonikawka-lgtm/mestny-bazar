import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Future integration point for knowledge source export. Not wired yet. */
export interface IKnowledgeSourceExportProvider {
  exportTo(knowledgeSources: readonly KnowledgeSource[]): Promise<string>;
}

import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Future integration point for knowledge source import. Not wired yet. */
export interface IKnowledgeSourceImportProvider {
  importFrom(source: string): Promise<readonly KnowledgeSource[]>;
}

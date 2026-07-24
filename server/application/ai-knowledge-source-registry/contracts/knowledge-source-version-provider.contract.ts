import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Future integration point for knowledge source version management. Not wired yet. */
export interface IKnowledgeSourceVersionProvider {
  listVersions(knowledgeSourceId: string): Promise<readonly KnowledgeSource[]>;
  getVersion(knowledgeSourceId: string, version: string): Promise<KnowledgeSource | null>;
}

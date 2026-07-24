import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Future integration point for knowledge source synchronization. Not wired yet. */
export interface IKnowledgeSourceSynchronizationProvider {
  synchronize(knowledgeSources: readonly KnowledgeSource[]): Promise<void>;
}

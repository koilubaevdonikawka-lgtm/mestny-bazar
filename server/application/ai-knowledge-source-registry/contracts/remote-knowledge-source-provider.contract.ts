import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Future integration point for external knowledge source providers. Not wired yet. */
export interface IRemoteKnowledgeSourceProvider {
  fetchRemote(knowledgeSourceId: string): Promise<KnowledgeSource | null>;
  pushRemote(knowledgeSource: KnowledgeSource): Promise<void>;
}

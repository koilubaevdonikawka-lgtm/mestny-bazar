import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

export interface IKnowledgeSourceSerializer {
  serialize(knowledgeSource: KnowledgeSource): Promise<string>;
  deserialize(serialized: string): Promise<KnowledgeSource>;
}

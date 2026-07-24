import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

export interface IKnowledgeSourceCatalog {
  register(knowledgeSource: KnowledgeSource): Promise<void>;
  remove(knowledgeSourceId: string): Promise<void>;
  findById(knowledgeSourceId: string): Promise<KnowledgeSource | null>;
  findByName(name: string): Promise<KnowledgeSource | null>;
  findByCategory(category: string): Promise<readonly KnowledgeSource[]>;
  listAll(): Promise<readonly KnowledgeSource[]>;
}

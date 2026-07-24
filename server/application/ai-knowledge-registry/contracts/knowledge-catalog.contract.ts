import type { KnowledgeSource } from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

export interface IKnowledgeCatalog {
  register(source: KnowledgeSource): Promise<void>;
  remove(knowledgeId: string): Promise<void>;
  findById(knowledgeId: string): Promise<KnowledgeSource | null>;
  findByName(name: string): Promise<KnowledgeSource | null>;
  findByCategory(category: string): Promise<readonly KnowledgeSource[]>;
  listAll(): Promise<readonly KnowledgeSource[]>;
}

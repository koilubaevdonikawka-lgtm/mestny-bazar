import type { KnowledgeSource } from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

export interface IKnowledgeSourceRepository {
  save(source: KnowledgeSource): Promise<void>;
  findById(knowledgeId: string): Promise<KnowledgeSource | null>;
  findByName(name: string): Promise<KnowledgeSource | null>;
  findByCategory(category: string): Promise<readonly KnowledgeSource[]>;
  findAll(): Promise<readonly KnowledgeSource[]>;
  delete(knowledgeId: string): Promise<boolean>;
}

import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

export interface IKnowledgeSourceRepository {
  save(knowledgeSource: KnowledgeSource): Promise<void>;
  findById(knowledgeSourceId: string): Promise<KnowledgeSource | null>;
  findByName(name: string): Promise<KnowledgeSource | null>;
  findByCategory(category: string): Promise<readonly KnowledgeSource[]>;
  findAll(): Promise<readonly KnowledgeSource[]>;
  delete(knowledgeSourceId: string): Promise<boolean>;
}

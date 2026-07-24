import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

export interface IKnowledgeGraphRepository {
  save(knowledgeGraph: KnowledgeGraph): Promise<void>;
  findById(knowledgeGraphId: string): Promise<KnowledgeGraph | null>;
  findByName(name: string): Promise<KnowledgeGraph | null>;
  findByCategory(category: string): Promise<readonly KnowledgeGraph[]>;
  findAll(): Promise<readonly KnowledgeGraph[]>;
  delete(knowledgeGraphId: string): Promise<boolean>;
}

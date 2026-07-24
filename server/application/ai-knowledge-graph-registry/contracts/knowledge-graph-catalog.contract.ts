import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

export interface IKnowledgeGraphCatalog {
  register(knowledgeGraph: KnowledgeGraph): Promise<void>;
  remove(knowledgeGraphId: string): Promise<void>;
  findById(knowledgeGraphId: string): Promise<KnowledgeGraph | null>;
  findByName(name: string): Promise<KnowledgeGraph | null>;
  findByCategory(category: string): Promise<readonly KnowledgeGraph[]>;
  listAll(): Promise<readonly KnowledgeGraph[]>;
}

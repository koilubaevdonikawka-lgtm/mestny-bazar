import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

export interface IKnowledgeGraphSerializer {
  serialize(knowledgeGraph: KnowledgeGraph): Promise<string>;
  deserialize(serialized: string): Promise<KnowledgeGraph>;
}

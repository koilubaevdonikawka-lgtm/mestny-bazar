import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** Future integration point for external knowledge graph providers. Not wired yet. */
export interface IRemoteKnowledgeGraphProvider {
  fetchRemote(knowledgeGraphId: string): Promise<KnowledgeGraph | null>;
  pushRemote(knowledgeGraph: KnowledgeGraph): Promise<void>;
}

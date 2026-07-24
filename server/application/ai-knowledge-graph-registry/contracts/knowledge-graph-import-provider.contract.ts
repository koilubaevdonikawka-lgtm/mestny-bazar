import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** Future integration point for knowledge graph import. Not wired yet. */
export interface IKnowledgeGraphImportProvider {
  importFrom(source: string): Promise<readonly KnowledgeGraph[]>;
}

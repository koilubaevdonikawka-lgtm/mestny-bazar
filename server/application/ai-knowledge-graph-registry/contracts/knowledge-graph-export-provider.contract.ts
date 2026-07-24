import type { KnowledgeGraph } from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** Future integration point for knowledge graph export. Not wired yet. */
export interface IKnowledgeGraphExportProvider {
  exportTo(knowledgeGraphs: readonly KnowledgeGraph[]): Promise<string>;
}

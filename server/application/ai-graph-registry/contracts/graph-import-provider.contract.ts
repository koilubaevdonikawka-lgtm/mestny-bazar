import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

/** Future integration point for graph import. Not wired yet. */
export interface IGraphImportProvider {
  importFrom(source: string): Promise<readonly Graph[]>;
}

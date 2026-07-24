import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

/** Future integration point for graph export. Not wired yet. */
export interface IGraphExportProvider {
  exportTo(graphs: readonly Graph[]): Promise<string>;
}

import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

/** Future integration point for graph synchronization. Not wired yet. */
export interface IGraphSynchronizationProvider {
  synchronize(graphs: readonly Graph[]): Promise<void>;
}

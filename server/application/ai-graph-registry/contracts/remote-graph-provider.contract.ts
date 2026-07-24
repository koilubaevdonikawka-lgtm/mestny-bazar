import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

/** Future integration point for external graph providers. Not wired yet. */
export interface IRemoteGraphProvider {
  fetchRemote(graphId: string): Promise<Graph | null>;
  pushRemote(graph: Graph): Promise<void>;
}

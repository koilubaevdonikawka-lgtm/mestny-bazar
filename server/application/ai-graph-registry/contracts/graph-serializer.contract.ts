import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

export interface IGraphSerializer {
  serialize(graph: Graph): Promise<string>;
  deserialize(serialized: string): Promise<Graph>;
}

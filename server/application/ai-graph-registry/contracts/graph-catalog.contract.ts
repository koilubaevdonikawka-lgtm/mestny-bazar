import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

export interface IGraphCatalog {
  register(graph: Graph): Promise<void>;
  remove(graphId: string): Promise<void>;
  findById(graphId: string): Promise<Graph | null>;
  findByName(name: string): Promise<Graph | null>;
  findByCategory(category: string): Promise<readonly Graph[]>;
  listAll(): Promise<readonly Graph[]>;
}

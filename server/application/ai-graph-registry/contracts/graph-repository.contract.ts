import type { Graph } from "@server/application/ai-graph-registry/models/graph.model";

export interface IGraphRepository {
  save(graph: Graph): Promise<void>;
  findById(graphId: string): Promise<Graph | null>;
  findByName(name: string): Promise<Graph | null>;
  findByCategory(category: string): Promise<readonly Graph[]>;
  findAll(): Promise<readonly Graph[]>;
  delete(graphId: string): Promise<boolean>;
}

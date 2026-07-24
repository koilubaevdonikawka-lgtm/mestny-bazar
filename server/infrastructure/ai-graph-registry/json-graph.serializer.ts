import type { IGraphSerializer } from "@server/application/ai-graph-registry/contracts/graph-serializer.contract";
import {
  createGraph,
  type Graph,
} from "@server/application/ai-graph-registry/models/graph.model";

/** JSON-based graph serializer. */
export class JsonGraphSerializer implements IGraphSerializer {
  async serialize(graph: Graph): Promise<string> {
    return JSON.stringify(graph);
  }

  async deserialize(serialized: string): Promise<Graph> {
    if (!serialized.trim()) {
      throw new Error("Serialized graph cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Graph>;
    return createGraph({
      graphId: parsed.graphId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

import type { IKnowledgeGraphSerializer } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-serializer.contract";
import {
  createKnowledgeGraph,
  type KnowledgeGraph,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** JSON-based knowledge graph serializer. */
export class JsonKnowledgeGraphSerializer implements IKnowledgeGraphSerializer {
  async serialize(knowledgeGraph: KnowledgeGraph): Promise<string> {
    return JSON.stringify(knowledgeGraph);
  }

  async deserialize(serialized: string): Promise<KnowledgeGraph> {
    if (!serialized.trim()) {
      throw new Error("Serialized knowledge graph cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<KnowledgeGraph>;
    return createKnowledgeGraph({
      knowledgeGraphId: parsed.knowledgeGraphId ?? "",
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

import type { IKnowledgeSourceSerializer } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-serializer.contract";
import {
  createKnowledgeSource,
  type KnowledgeSource,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** JSON-based knowledge source serializer. */
export class JsonKnowledgeSourceSerializer implements IKnowledgeSourceSerializer {
  async serialize(knowledgeSource: KnowledgeSource): Promise<string> {
    return JSON.stringify(knowledgeSource);
  }

  async deserialize(serialized: string): Promise<KnowledgeSource> {
    if (!serialized.trim()) {
      throw new Error("Serialized knowledge source cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<KnowledgeSource>;
    return createKnowledgeSource({
      knowledgeSourceId: parsed.knowledgeSourceId ?? "",
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

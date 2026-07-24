import type { IKnowledgeSerializer } from "@server/application/ai-knowledge-registry/contracts/knowledge-serializer.contract";

/** JSON-based knowledge serializer. */
export class JsonKnowledgeSerializer implements IKnowledgeSerializer {
  async serialize(data: unknown): Promise<string> {
    return JSON.stringify(data ?? {});
  }

  async deserialize(serialized: string): Promise<unknown> {
    if (!serialized.trim()) {
      return Object.freeze({});
    }
    return JSON.parse(serialized) as unknown;
  }
}

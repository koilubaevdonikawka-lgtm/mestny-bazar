import type { IToolSerializer } from "@server/application/ai-tool-registry/contracts/tool-serializer.contract";
import { createAiTool, type AiTool } from "@server/application/ai-tool-registry/models/tool.model";

/** JSON-based tool description serializer. */
export class JsonToolSerializer implements IToolSerializer {
  serialize(tool: AiTool): string {
    return JSON.stringify({
      toolId: tool.toolId,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      schema: tool.schema,
      status: tool.status,
    });
  }

  deserialize(payload: string): AiTool {
    const parsed = JSON.parse(payload) as {
      toolId: string;
      name: string;
      description?: string;
      category?: string;
      schema?: unknown;
      status?: "active" | "inactive";
      createdAt?: string;
      updatedAt?: string;
    };

    return createAiTool(parsed);
  }
}

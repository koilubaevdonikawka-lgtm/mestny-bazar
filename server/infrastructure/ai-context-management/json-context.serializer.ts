import type { IContextSerializer } from "@server/application/ai-context-management/contracts/context-serializer.contract";
import {
  createContext,
  type Context,
} from "@server/application/ai-context-management/models/context.model";

/** JSON-based context serializer. */
export class JsonContextSerializer implements IContextSerializer {
  async serialize(context: Context): Promise<string> {
    return JSON.stringify(context);
  }

  async deserialize(serialized: string): Promise<Context> {
    if (!serialized.trim()) {
      throw new Error("Serialized context cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Context>;
    return createContext({
      contextId: parsed.contextId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      content: parsed.content ?? "",
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

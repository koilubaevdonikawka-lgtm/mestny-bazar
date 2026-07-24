import type { IActionSerializer } from "@server/application/ai-action-registry/contracts/action-serializer.contract";
import {
  createAction,
  type Action,
} from "@server/application/ai-action-registry/models/action.model";

/** JSON-based action serializer. */
export class JsonActionSerializer implements IActionSerializer {
  async serialize(action: Action): Promise<string> {
    return JSON.stringify(action);
  }

  async deserialize(serialized: string): Promise<Action> {
    if (!serialized.trim()) {
      throw new Error("Serialized action cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Action>;
    return createAction({
      actionId: parsed.actionId ?? "",
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

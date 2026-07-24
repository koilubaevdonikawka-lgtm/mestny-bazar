import type { ICommandSerializer } from "@server/application/ai-command-registry/contracts/command-serializer.contract";
import {
  createCommand,
  type Command,
} from "@server/application/ai-command-registry/models/command.model";

/** JSON-based command serializer. */
export class JsonCommandSerializer implements ICommandSerializer {
  async serialize(command: Command): Promise<string> {
    return JSON.stringify(command);
  }

  async deserialize(serialized: string): Promise<Command> {
    if (!serialized.trim()) {
      throw new Error("Serialized command cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Command>;
    return createCommand({
      commandId: parsed.commandId ?? "",
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

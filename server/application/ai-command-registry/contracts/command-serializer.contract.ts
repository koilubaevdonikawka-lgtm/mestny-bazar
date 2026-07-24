import type { Command } from "@server/application/ai-command-registry/models/command.model";

export interface ICommandSerializer {
  serialize(command: Command): Promise<string>;
  deserialize(serialized: string): Promise<Command>;
}

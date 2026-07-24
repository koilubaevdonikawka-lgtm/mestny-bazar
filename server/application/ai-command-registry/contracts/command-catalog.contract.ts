import type { Command } from "@server/application/ai-command-registry/models/command.model";

export interface ICommandCatalog {
  register(command: Command): Promise<void>;
  remove(commandId: string): Promise<void>;
  findById(commandId: string): Promise<Command | null>;
  findByName(name: string): Promise<Command | null>;
  findByCategory(category: string): Promise<readonly Command[]>;
  listAll(): Promise<readonly Command[]>;
}

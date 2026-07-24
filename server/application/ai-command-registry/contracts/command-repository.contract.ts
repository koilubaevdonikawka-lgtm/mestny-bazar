import type { Command } from "@server/application/ai-command-registry/models/command.model";

export interface ICommandRepository {
  save(command: Command): Promise<void>;
  findById(commandId: string): Promise<Command | null>;
  findByName(name: string): Promise<Command | null>;
  findByCategory(category: string): Promise<readonly Command[]>;
  findAll(): Promise<readonly Command[]>;
  delete(commandId: string): Promise<boolean>;
}

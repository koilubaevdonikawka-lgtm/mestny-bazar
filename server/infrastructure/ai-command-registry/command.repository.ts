import type { ICommandRepository } from "@server/application/ai-command-registry/contracts/command-repository.contract";
import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** In-memory command store. */
export class CommandRepository implements ICommandRepository {
  private readonly commands = new Map<string, Command>();
  private readonly commandsByName = new Map<string, string>();
  private readonly commandsByCategory = new Map<string, Set<string>>();

  async save(command: Command): Promise<void> {
    const existing = this.commands.get(command.commandId);
    if (existing) {
      if (existing.name !== command.name) {
        this.commandsByName.delete(existing.name);
      }
      if (existing.category !== command.category) {
        this.removeFromCategory(existing.category, existing.commandId);
      }
    }

    this.commands.set(command.commandId, command);
    this.commandsByName.set(command.name, command.commandId);
    this.addToCategory(command.category, command.commandId);
  }

  async findById(commandId: string): Promise<Command | null> {
    return this.commands.get(commandId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Command | null> {
    const commandId = this.commandsByName.get(name.trim());
    if (!commandId) {
      return null;
    }
    return this.commands.get(commandId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Command[]> {
    const commandIds = this.commandsByCategory.get(category.trim());
    if (!commandIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...commandIds]
        .map((commandId) => this.commands.get(commandId))
        .filter((command): command is Command => command !== undefined),
    );
  }

  async findAll(): Promise<readonly Command[]> {
    return Object.freeze([...this.commands.values()]);
  }

  async delete(commandId: string): Promise<boolean> {
    const command = await this.findById(commandId);
    if (!command) {
      return false;
    }
    this.commands.delete(command.commandId);
    this.commandsByName.delete(command.name);
    this.removeFromCategory(command.category, command.commandId);
    return true;
  }

  private addToCategory(category: string, commandId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.commandsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(commandId);
    this.commandsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, commandId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.commandsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(commandId);
    if (categorySet.size === 0) {
      this.commandsByCategory.delete(normalizedCategory);
    }
  }
}

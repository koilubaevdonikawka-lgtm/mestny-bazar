/**
 * AI Command Registry — unified registry for AI commands.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ICommandCatalog } from "@server/application/ai-command-registry/contracts/command-catalog.contract";
import type { ICommandRepository } from "@server/application/ai-command-registry/contracts/command-repository.contract";
import type { ICommandSerializer } from "@server/application/ai-command-registry/contracts/command-serializer.contract";
import type { ICommandStatisticsProvider } from "@server/application/ai-command-registry/contracts/command-statistics-provider.contract";
import type { ICommandValidator } from "@server/application/ai-command-registry/contracts/command-validator.contract";
import {
  createCommand,
  type DeleteCommandResult,
  type FindCommandByNameResult,
  type ListCommandsByCategoryResult,
  type ListCommandsResult,
  type RegisterCommandInput,
  type Command,
  type CommandRegistryStatistics,
  type UpdateCommandInput,
} from "@server/application/ai-command-registry/models/command.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiCommandRegistryService {
  constructor(
    private readonly commandRepository: ICommandRepository,
    private readonly commandCatalog: ICommandCatalog,
    private readonly commandValidator: ICommandValidator,
    private readonly commandSerializer: ICommandSerializer,
    private readonly statisticsProvider: ICommandStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCommand(input: RegisterCommandInput): Promise<Command> {
    const validation = await this.commandValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.commandRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Command already exists with name: ${input.name.trim()}`);
    }

    const command = createCommand({
      commandId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.commandRepository.save(command);
    await this.commandCatalog.register(command);
    return command;
  }

  async getCommand(commandId: string): Promise<Command | null> {
    return this.commandRepository.findById(commandId.trim());
  }

  async listCommands(): Promise<ListCommandsResult> {
    const commands = Object.freeze(
      [...(await this.commandRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ commands, total: commands.length });
  }

  async updateCommand(input: UpdateCommandInput): Promise<Command> {
    const commandId = input.commandId.trim();
    const existing = await this.commandRepository.findById(commandId);
    if (!existing) {
      throw new Error(`Command not found: ${commandId}`);
    }

    const validation = await this.commandValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.commandRepository.findByName(input.name.trim());
      if (duplicate && duplicate.commandId !== existing.commandId) {
        throw new Error(`Command already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createCommand({
      commandId: existing.commandId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.commandRepository.save(updated);
    await this.commandCatalog.register(updated);
    return updated;
  }

  async deleteCommand(commandId: string): Promise<DeleteCommandResult> {
    const normalizedCommandId = commandId.trim();
    const deleted = await this.commandRepository.delete(normalizedCommandId);
    if (deleted) {
      await this.commandCatalog.remove(normalizedCommandId);
    }
    return Object.freeze({ commandId: normalizedCommandId, deleted });
  }

  async findCommandByName(name: string): Promise<FindCommandByNameResult> {
    const normalizedName = name.trim();
    const command = await this.commandRepository.findByName(normalizedName);
    return Object.freeze({ command });
  }

  async listCommandsByCategory(category: string): Promise<ListCommandsByCategoryResult> {
    const normalizedCategory = category.trim();
    const commands = Object.freeze(
      [...(await this.commandRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      commands,
      total: commands.length,
      category: normalizedCategory,
    });
  }

  async getCommandRegistryStatistics(): Promise<CommandRegistryStatistics> {
    const commands = await this.commandRepository.findAll();
    const activeCommands = commands.filter((command) => command.status === "active").length;
    const categories = Object.freeze([
      ...new Set(commands.map((command) => command.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalCommands: commands.length,
      activeCommands,
      categories,
    });
  }

  async serializeCommand(command: Command): Promise<string> {
    return this.commandSerializer.serialize(command);
  }

  async deserializeCommand(serialized: string): Promise<Command> {
    return this.commandSerializer.deserialize(serialized);
  }
}

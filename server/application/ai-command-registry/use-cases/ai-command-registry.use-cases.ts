import type {
  DeleteCommandResult,
  FindCommandByNameResult,
  ListCommandsByCategoryResult,
  ListCommandsResult,
  RegisterCommandInput,
  Command,
  CommandRegistryStatistics,
  UpdateCommandInput,
} from "@server/application/ai-command-registry/models/command.model";
import type { AiCommandRegistryService } from "@server/application/ai-command-registry/services/ai-command-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCommandUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(input: RegisterCommandInput): Promise<UseCaseResult<Command>> {
    return this.commandRegistry.registerCommand(input).then(useCaseResult);
  }
}

export class GetCommandUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(commandId: string): Promise<UseCaseResult<Command | null>> {
    return this.commandRegistry.getCommand(commandId).then(useCaseResult);
  }
}

export class ListCommandsUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(): Promise<UseCaseResult<ListCommandsResult>> {
    return this.commandRegistry.listCommands().then(useCaseResult);
  }
}

export class UpdateCommandUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(input: UpdateCommandInput): Promise<UseCaseResult<Command>> {
    return this.commandRegistry.updateCommand(input).then(useCaseResult);
  }
}

export class DeleteCommandUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(commandId: string): Promise<UseCaseResult<DeleteCommandResult>> {
    return this.commandRegistry.deleteCommand(commandId).then(useCaseResult);
  }
}

export class FindCommandByNameUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindCommandByNameResult>> {
    return this.commandRegistry.findCommandByName(name).then(useCaseResult);
  }
}

export class ListCommandsByCategoryUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListCommandsByCategoryResult>> {
    return this.commandRegistry.listCommandsByCategory(category).then(useCaseResult);
  }
}

export class GetCommandRegistryStatisticsUseCase {
  constructor(private readonly commandRegistry: AiCommandRegistryService) {}

  execute(): Promise<UseCaseResult<CommandRegistryStatistics>> {
    return this.commandRegistry.getCommandRegistryStatistics().then(useCaseResult);
  }
}

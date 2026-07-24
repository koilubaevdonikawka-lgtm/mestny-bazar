import type {
  RegisterCommandInput,
  UpdateCommandInput,
} from "@server/application/ai-command-registry/models/command.model";
import {
  DeleteCommandUseCase,
  FindCommandByNameUseCase,
  GetCommandRegistryStatisticsUseCase,
  GetCommandUseCase,
  ListCommandsByCategoryUseCase,
  ListCommandsUseCase,
  RegisterCommandUseCase,
  UpdateCommandUseCase,
} from "@server/application/ai-command-registry/use-cases/ai-command-registry.use-cases";

/** Application facade for AI Command Registry scenario. */
export class AiCommandRegistryApplicationService {
  constructor(
    private readonly registerCommandUseCase: RegisterCommandUseCase,
    private readonly getCommandUseCase: GetCommandUseCase,
    private readonly listCommandsUseCase: ListCommandsUseCase,
    private readonly updateCommandUseCase: UpdateCommandUseCase,
    private readonly deleteCommandUseCase: DeleteCommandUseCase,
    private readonly findCommandByNameUseCase: FindCommandByNameUseCase,
    private readonly listCommandsByCategoryUseCase: ListCommandsByCategoryUseCase,
    private readonly getCommandRegistryStatisticsUseCase: GetCommandRegistryStatisticsUseCase,
  ) {}

  registerCommand(input: RegisterCommandInput) {
    return this.registerCommandUseCase.execute(input);
  }

  getCommand(commandId: string) {
    return this.getCommandUseCase.execute(commandId);
  }

  listCommands() {
    return this.listCommandsUseCase.execute();
  }

  updateCommand(input: UpdateCommandInput) {
    return this.updateCommandUseCase.execute(input);
  }

  deleteCommand(commandId: string) {
    return this.deleteCommandUseCase.execute(commandId);
  }

  findCommandByName(name: string) {
    return this.findCommandByNameUseCase.execute(name);
  }

  listCommandsByCategory(category: string) {
    return this.listCommandsByCategoryUseCase.execute(category);
  }

  getCommandRegistryStatistics() {
    return this.getCommandRegistryStatisticsUseCase.execute();
  }
}

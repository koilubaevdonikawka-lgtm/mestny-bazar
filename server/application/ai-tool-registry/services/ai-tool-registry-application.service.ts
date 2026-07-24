import type {
  RegisterToolInput,
  UpdateToolInput,
} from "@server/application/ai-tool-registry/models/tool.model";
import {
  DeleteToolUseCase,
  FindToolByNameUseCase,
  GetToolRegistryStatisticsUseCase,
  GetToolUseCase,
  ListToolsByCategoryUseCase,
  ListToolsUseCase,
  RegisterToolUseCase,
  UpdateToolUseCase,
} from "@server/application/ai-tool-registry/use-cases/ai-tool-registry.use-cases";

/** Application facade for AI Tool Registry scenario. */
export class AiToolRegistryApplicationService {
  constructor(
    private readonly registerToolUseCase: RegisterToolUseCase,
    private readonly getToolUseCase: GetToolUseCase,
    private readonly listToolsUseCase: ListToolsUseCase,
    private readonly updateToolUseCase: UpdateToolUseCase,
    private readonly deleteToolUseCase: DeleteToolUseCase,
    private readonly findToolByNameUseCase: FindToolByNameUseCase,
    private readonly listToolsByCategoryUseCase: ListToolsByCategoryUseCase,
    private readonly getToolRegistryStatisticsUseCase: GetToolRegistryStatisticsUseCase,
  ) {}

  registerTool(input: RegisterToolInput) {
    return this.registerToolUseCase.execute(input);
  }

  getTool(toolId: string) {
    return this.getToolUseCase.execute(toolId);
  }

  listTools() {
    return this.listToolsUseCase.execute();
  }

  updateTool(input: UpdateToolInput) {
    return this.updateToolUseCase.execute(input);
  }

  deleteTool(toolId: string) {
    return this.deleteToolUseCase.execute(toolId);
  }

  findToolByName(name: string) {
    return this.findToolByNameUseCase.execute(name);
  }

  listToolsByCategory(category: string) {
    return this.listToolsByCategoryUseCase.execute(category);
  }

  getToolRegistryStatistics() {
    return this.getToolRegistryStatisticsUseCase.execute();
  }
}

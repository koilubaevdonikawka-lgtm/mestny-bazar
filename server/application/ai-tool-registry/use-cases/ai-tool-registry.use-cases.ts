import type {
  AiTool,
  DeleteToolResult,
  FindToolByNameResult,
  ListToolsByCategoryResult,
  ListToolsResult,
  RegisterToolInput,
  ToolRegistryStatistics,
  UpdateToolInput,
} from "@server/application/ai-tool-registry/models/tool.model";
import type { AiToolRegistryService } from "@server/application/ai-tool-registry/services/ai-tool-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterToolUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(input: RegisterToolInput): Promise<UseCaseResult<AiTool>> {
    return this.registry.registerTool(input).then(useCaseResult);
  }
}

export class GetToolUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(toolId: string): Promise<UseCaseResult<AiTool | null>> {
    return this.registry.getTool(toolId).then(useCaseResult);
  }
}

export class ListToolsUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(): Promise<UseCaseResult<ListToolsResult>> {
    return this.registry.listTools().then(useCaseResult);
  }
}

export class UpdateToolUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(input: UpdateToolInput): Promise<UseCaseResult<AiTool>> {
    return this.registry.updateTool(input).then(useCaseResult);
  }
}

export class DeleteToolUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(toolId: string): Promise<UseCaseResult<DeleteToolResult>> {
    return this.registry.deleteTool(toolId).then(useCaseResult);
  }
}

export class FindToolByNameUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindToolByNameResult>> {
    return this.registry.findToolByName(name).then(useCaseResult);
  }
}

export class ListToolsByCategoryUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListToolsByCategoryResult>> {
    return this.registry.listToolsByCategory(category).then(useCaseResult);
  }
}

export class GetToolRegistryStatisticsUseCase {
  constructor(private readonly registry: AiToolRegistryService) {}

  execute(): Promise<UseCaseResult<ToolRegistryStatistics>> {
    return this.registry.getToolRegistryStatistics().then(useCaseResult);
  }
}

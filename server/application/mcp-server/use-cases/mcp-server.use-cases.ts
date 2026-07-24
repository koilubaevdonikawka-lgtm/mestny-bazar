import type {
  GetMcpRequestHistoryResult,
  HandleMcpRequestInput,
  HandleMcpRequestResult,
  ListMcpResourcesResult,
  ListMcpToolsResult,
  McpResource,
  McpServerStatistics,
  McpTool,
  RegisterMcpResourceInput,
  RegisterMcpToolInput,
} from "@server/application/mcp-server/models/mcp.model";
import type { McpServerService } from "@server/application/mcp-server/services/mcp-server.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterMcpToolUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(input: RegisterMcpToolInput): Promise<UseCaseResult<McpTool>> {
    return this.mcpServer.registerMcpTool(input).then(useCaseResult);
  }
}

export class GetMcpToolUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(toolId: string): Promise<UseCaseResult<McpTool | null>> {
    return this.mcpServer.getMcpTool(toolId).then(useCaseResult);
  }
}

export class ListMcpToolsUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(): Promise<UseCaseResult<ListMcpToolsResult>> {
    return this.mcpServer.listMcpTools().then(useCaseResult);
  }
}

export class RegisterMcpResourceUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(input: RegisterMcpResourceInput): Promise<UseCaseResult<McpResource>> {
    return this.mcpServer.registerMcpResource(input).then(useCaseResult);
  }
}

export class ListMcpResourcesUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(): Promise<UseCaseResult<ListMcpResourcesResult>> {
    return this.mcpServer.listMcpResources().then(useCaseResult);
  }
}

export class HandleMcpRequestUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(input: HandleMcpRequestInput): Promise<UseCaseResult<HandleMcpRequestResult>> {
    return this.mcpServer.handleMcpRequest(input).then(useCaseResult);
  }
}

export class GetMcpRequestHistoryUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(): Promise<UseCaseResult<GetMcpRequestHistoryResult>> {
    return this.mcpServer.getMcpRequestHistory().then(useCaseResult);
  }
}

export class GetMcpServerStatisticsUseCase {
  constructor(private readonly mcpServer: McpServerService) {}

  execute(): Promise<UseCaseResult<McpServerStatistics>> {
    return this.mcpServer.getMcpServerStatistics().then(useCaseResult);
  }
}

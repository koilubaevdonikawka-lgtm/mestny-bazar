import type {
  HandleMcpRequestInput,
  RegisterMcpResourceInput,
  RegisterMcpToolInput,
} from "@server/application/mcp-server/models/mcp.model";
import {
  GetMcpRequestHistoryUseCase,
  GetMcpServerStatisticsUseCase,
  GetMcpToolUseCase,
  HandleMcpRequestUseCase,
  ListMcpResourcesUseCase,
  ListMcpToolsUseCase,
  RegisterMcpResourceUseCase,
  RegisterMcpToolUseCase,
} from "@server/application/mcp-server/use-cases/mcp-server.use-cases";

/** Application facade for MCP Server scenario. */
export class McpServerApplicationService {
  constructor(
    private readonly registerMcpToolUseCase: RegisterMcpToolUseCase,
    private readonly getMcpToolUseCase: GetMcpToolUseCase,
    private readonly listMcpToolsUseCase: ListMcpToolsUseCase,
    private readonly registerMcpResourceUseCase: RegisterMcpResourceUseCase,
    private readonly listMcpResourcesUseCase: ListMcpResourcesUseCase,
    private readonly handleMcpRequestUseCase: HandleMcpRequestUseCase,
    private readonly getMcpRequestHistoryUseCase: GetMcpRequestHistoryUseCase,
    private readonly getMcpServerStatisticsUseCase: GetMcpServerStatisticsUseCase,
  ) {}

  registerMcpTool(input: RegisterMcpToolInput) {
    return this.registerMcpToolUseCase.execute(input);
  }

  getMcpTool(toolId: string) {
    return this.getMcpToolUseCase.execute(toolId);
  }

  listMcpTools() {
    return this.listMcpToolsUseCase.execute();
  }

  registerMcpResource(input: RegisterMcpResourceInput) {
    return this.registerMcpResourceUseCase.execute(input);
  }

  listMcpResources() {
    return this.listMcpResourcesUseCase.execute();
  }

  handleMcpRequest(input: HandleMcpRequestInput) {
    return this.handleMcpRequestUseCase.execute(input);
  }

  getMcpRequestHistory() {
    return this.getMcpRequestHistoryUseCase.execute();
  }

  getMcpServerStatistics() {
    return this.getMcpServerStatisticsUseCase.execute();
  }
}

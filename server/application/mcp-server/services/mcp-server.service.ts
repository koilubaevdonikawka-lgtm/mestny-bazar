/**
 * MCP Server — Model Context Protocol server implementation.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IMcpProtocolHandler } from "@server/application/mcp-server/contracts/mcp-protocol-handler.contract";
import type { IMcpRequestHistoryRepository } from "@server/application/mcp-server/contracts/mcp-request-history-repository.contract";
import type { IMcpResourceRepository } from "@server/application/mcp-server/contracts/mcp-resource-repository.contract";
import type { IMcpStatisticsProvider } from "@server/application/mcp-server/contracts/mcp-statistics-provider.contract";
import type { IMcpToolRepository } from "@server/application/mcp-server/contracts/mcp-tool-repository.contract";
import {
  createMcpRequestHistoryEntry,
  createMcpResource,
  createMcpTool,
  type GetMcpRequestHistoryResult,
  type HandleMcpRequestInput,
  type HandleMcpRequestResult,
  type ListMcpResourcesResult,
  type ListMcpToolsResult,
  type McpResource,
  type McpServerStatistics,
  type McpTool,
  type RegisterMcpResourceInput,
  type RegisterMcpToolInput,
} from "@server/application/mcp-server/models/mcp.model";
import type { IIdGenerator } from "@server/application/ports";

export class McpServerService {
  constructor(
    private readonly toolRepository: IMcpToolRepository,
    private readonly resourceRepository: IMcpResourceRepository,
    private readonly protocolHandler: IMcpProtocolHandler,
    private readonly requestHistoryRepository: IMcpRequestHistoryRepository,
    private readonly statisticsProvider: IMcpStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerMcpTool(input: RegisterMcpToolInput): Promise<McpTool> {
    const name = input.name.trim();
    if (!name) {
      throw new Error("MCP tool name is required.");
    }
    if (await this.toolRepository.findByName(name)) {
      throw new Error(`MCP tool already exists: ${name}`);
    }

    const tool = createMcpTool({
      toolId: this.idGenerator.generate(),
      name,
      description: input.description,
      inputSchema: input.inputSchema,
      status: input.status,
    });

    await this.toolRepository.save(tool);
    return tool;
  }

  async getMcpTool(toolId: string): Promise<McpTool | null> {
    return this.toolRepository.findById(toolId.trim());
  }

  async listMcpTools(): Promise<ListMcpToolsResult> {
    const tools = Object.freeze(
      [...(await this.toolRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ tools, total: tools.length });
  }

  async registerMcpResource(input: RegisterMcpResourceInput): Promise<McpResource> {
    const uri = input.uri.trim();
    const name = input.name.trim();
    if (!uri) {
      throw new Error("MCP resource URI is required.");
    }
    if (!name) {
      throw new Error("MCP resource name is required.");
    }
    if (await this.resourceRepository.findByUri(uri)) {
      throw new Error(`MCP resource already exists: ${uri}`);
    }

    const resource = createMcpResource({
      resourceId: this.idGenerator.generate(),
      uri,
      name,
      description: input.description,
      mimeType: input.mimeType,
    });

    await this.resourceRepository.save(resource);
    return resource;
  }

  async listMcpResources(): Promise<ListMcpResourcesResult> {
    const resources = Object.freeze(
      [...(await this.resourceRepository.findAll())].sort((left, right) =>
        left.uri.localeCompare(right.uri),
      ),
    );
    return Object.freeze({ resources, total: resources.length });
  }

  async handleMcpRequest(input: HandleMcpRequestInput): Promise<HandleMcpRequestResult> {
    const method = input.method.trim();
    if (!method) {
      throw new Error("MCP request method is required.");
    }

    const context = Object.freeze({
      tools: await this.toolRepository.findAll(),
      resources: await this.resourceRepository.findAll(),
    });

    const handled = await this.protocolHandler.handle(input, context);
    await this.statisticsProvider.recordRequest();

    const requestId = this.idGenerator.generate();
    const requestInput = Object.freeze({
      method,
      params: input.params ?? null,
      toolId: input.toolId ?? null,
      resourceUri: input.resourceUri ?? null,
    });

    await this.requestHistoryRepository.save(
      createMcpRequestHistoryEntry({
        requestId,
        method,
        input: requestInput,
        response: handled.response,
        mock: handled.mock,
      }),
    );

    return Object.freeze({
      requestId,
      method,
      response: handled.response,
      mock: handled.mock,
    });
  }

  async getMcpRequestHistory(): Promise<GetMcpRequestHistoryResult> {
    const entries = Object.freeze([...(await this.requestHistoryRepository.findAll())]);
    return Object.freeze({ entries, total: entries.length });
  }

  async getMcpServerStatistics(): Promise<McpServerStatistics> {
    const tools = await this.toolRepository.findAll();
    const activeTools = tools.filter((tool) => tool.status === "active").length;
    const resources = await this.resourceRepository.findAll();

    return this.statisticsProvider.getStatistics({
      totalTools: tools.length,
      activeTools,
      totalResources: resources.length,
    });
  }
}

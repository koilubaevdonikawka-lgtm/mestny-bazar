import { ApiValidationError } from "@server/api/errors/api.errors";
import type { McpServerApplicationService } from "@server/application/mcp-server/services/mcp-server-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** MCP Server HTTP controller — protocol registration and mock request handling only. */
export class McpServerController {
  constructor(private readonly mcpServer: McpServerApplicationService) {}

  async registerTool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.mcpServer.registerMcpTool({
      name,
      description: description ?? undefined,
      inputSchema: "inputSchema" in body ? body.inputSchema : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listTools(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.mcpServer.listMcpTools();
    return createJsonResponse(context, result.value);
  }

  async getTool(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const toolId = this.requireToolId(context);
    const result = await this.mcpServer.getMcpTool(toolId);
    if (!result.value) {
      throw new ApiValidationError({ toolId: [`MCP tool not found: ${toolId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async registerResource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const uri = readString(body.uri);
    const name = readString(body.name);

    if (!uri) {
      throw new ApiValidationError({ uri: ["uri is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const mimeType = readString(body.mimeType);

    const result = await this.mcpServer.registerMcpResource({
      uri,
      name,
      description: description ?? undefined,
      mimeType: mimeType ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listResources(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.mcpServer.listMcpResources();
    return createJsonResponse(context, result.value);
  }

  async handleRequest(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const method = readString(body.method);

    if (!method) {
      throw new ApiValidationError({ method: ["method is required"] });
    }

    const toolId = readString(body.toolId);
    const resourceUri = readString(body.resourceUri);

    const result = await this.mcpServer.handleMcpRequest({
      method,
      params: "params" in body ? body.params : undefined,
      toolId: toolId ?? undefined,
      resourceUri: resourceUri ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.mcpServer.getMcpRequestHistory();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.mcpServer.getMcpServerStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireToolId(context: ApiRequestContext): string {
    const toolId = readString(context.params.toolId);
    if (!toolId) {
      throw new ApiValidationError({ toolId: ["toolId is required"] });
    }
    return toolId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}

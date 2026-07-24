import type {
  IMcpProtocolHandler,
  McpProtocolContext,
  McpProtocolResponse,
} from "@server/application/mcp-server/contracts/mcp-protocol-handler.contract";
import type { HandleMcpRequestInput } from "@server/application/mcp-server/models/mcp.model";

/** Default mock MCP protocol handler — no external transports or clients. */
export class DefaultMcpProtocolHandler implements IMcpProtocolHandler {
  async handle(
    input: HandleMcpRequestInput,
    context: McpProtocolContext,
  ): Promise<McpProtocolResponse> {
    const method = input.method.trim();

    switch (method) {
      case "tools/list":
        return this.mockResponse({
          tools: context.tools
            .filter((tool) => tool.status === "active")
            .map((tool) => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
        });

      case "tools/call":
        return this.handleToolCall(input, context);

      case "resources/list":
        return this.mockResponse({
          resources: context.resources.map((resource) => ({
            uri: resource.uri,
            name: resource.name,
            description: resource.description,
            mimeType: resource.mimeType,
          })),
        });

      case "resources/read":
        return this.handleResourceRead(input, context);

      default:
        return this.mockResponse({
          message: `Mock MCP handler processed method: ${method}`,
          method,
          params: input.params ?? null,
        });
    }
  }

  private handleToolCall(
    input: HandleMcpRequestInput,
    context: McpProtocolContext,
  ): McpProtocolResponse {
    const tool =
      (input.toolId
        ? context.tools.find((entry) => entry.toolId === input.toolId.trim())
        : undefined) ??
      context.tools.find(
        (entry) => entry.name === this.readToolName(input.params),
      );

    if (!tool) {
      return this.mockResponse({
        isError: true,
        content: [{ type: "text", text: "Mock MCP tool not found." }],
      });
    }

    return this.mockResponse({
      content: [
        {
          type: "text",
          text: `Mock result from MCP tool: ${tool.name}`,
        },
      ],
      toolName: tool.name,
      params: input.params ?? null,
    });
  }

  private handleResourceRead(
    input: HandleMcpRequestInput,
    context: McpProtocolContext,
  ): McpProtocolResponse {
    const uri = input.resourceUri?.trim() ?? this.readResourceUri(input.params);
    const resource = context.resources.find((entry) => entry.uri === uri);

    if (!resource) {
      return this.mockResponse({
        isError: true,
        contents: [{ uri: uri ?? "unknown", text: "Mock MCP resource not found." }],
      });
    }

    return this.mockResponse({
      contents: [
        {
          uri: resource.uri,
          mimeType: resource.mimeType,
          text: `Mock content for resource: ${resource.name}`,
        },
      ],
    });
  }

  private readToolName(params: unknown): string | undefined {
    if (typeof params !== "object" || params === null) {
      return undefined;
    }
    const name = (params as Record<string, unknown>).name;
    return typeof name === "string" ? name : undefined;
  }

  private readResourceUri(params: unknown): string | undefined {
    if (typeof params !== "object" || params === null) {
      return undefined;
    }
    const uri = (params as Record<string, unknown>).uri;
    return typeof uri === "string" ? uri : undefined;
  }

  private mockResponse(response: unknown): McpProtocolResponse {
    return Object.freeze({ response, mock: true });
  }
}

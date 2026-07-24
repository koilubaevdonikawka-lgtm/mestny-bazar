import type {
  HandleMcpRequestInput,
  McpResource,
  McpTool,
} from "@server/application/mcp-server/models/mcp.model";

export interface McpProtocolContext {
  readonly tools: readonly McpTool[];
  readonly resources: readonly McpResource[];
}

export interface McpProtocolResponse {
  readonly response: unknown;
  readonly mock: boolean;
}

export interface IMcpProtocolHandler {
  handle(input: HandleMcpRequestInput, context: McpProtocolContext): Promise<McpProtocolResponse>;
}

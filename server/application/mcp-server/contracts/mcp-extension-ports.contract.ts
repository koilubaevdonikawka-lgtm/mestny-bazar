/**
 * Future integration ports for MCP Server.
 * Not implemented — reserved for external MCP transports.
 */

import type { HandleMcpRequestInput } from "@server/application/mcp-server/models/mcp.model";
import type { McpProtocolResponse } from "@server/application/mcp-server/contracts/mcp-protocol-handler.contract";

/** MCP Transport Provider — generic transport integration. */
export interface IMcpTransportProvider {
  sendRequest(input: HandleMcpRequestInput): Promise<McpProtocolResponse>;
}

/** MCP STDIO Transport Provider — STDIO transport integration. */
export interface IMcpStdioTransportProvider {
  listen(): Promise<void>;
  write(message: string): Promise<void>;
}

/** MCP HTTP Transport Provider — HTTP transport integration. */
export interface IMcpHttpTransportProvider {
  handleHttpRequest(body: unknown): Promise<McpProtocolResponse>;
}

/** MCP SSE Transport Provider — Server-Sent Events transport integration. */
export interface IMcpSseTransportProvider {
  streamEvents(): AsyncIterable<string>;
}

/** MCP Remote Server Provider — remote MCP server integration. */
export interface IMcpRemoteServerProvider {
  connect(endpoint: string): Promise<void>;
  forwardRequest(input: HandleMcpRequestInput): Promise<McpProtocolResponse>;
}

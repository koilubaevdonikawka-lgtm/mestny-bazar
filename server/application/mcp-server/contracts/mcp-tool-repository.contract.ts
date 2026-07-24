import type { McpTool } from "@server/application/mcp-server/models/mcp.model";

export interface IMcpToolRepository {
  save(tool: McpTool): Promise<void>;
  findById(toolId: string): Promise<McpTool | null>;
  findByName(name: string): Promise<McpTool | null>;
  findAll(): Promise<readonly McpTool[]>;
}

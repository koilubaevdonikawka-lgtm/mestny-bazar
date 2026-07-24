import type { IMcpToolRepository } from "@server/application/mcp-server/contracts/mcp-tool-repository.contract";
import type { McpTool } from "@server/application/mcp-server/models/mcp.model";

/** In-memory MCP tool store. */
export class McpToolRepository implements IMcpToolRepository {
  private readonly tools = new Map<string, McpTool>();
  private readonly toolsByName = new Map<string, string>();

  async save(tool: McpTool): Promise<void> {
    const existing = this.tools.get(tool.toolId);
    if (existing && existing.name !== tool.name) {
      this.toolsByName.delete(existing.name);
    }

    this.tools.set(tool.toolId, tool);
    this.toolsByName.set(tool.name, tool.toolId);
  }

  async findById(toolId: string): Promise<McpTool | null> {
    return this.tools.get(toolId.trim()) ?? null;
  }

  async findByName(name: string): Promise<McpTool | null> {
    const toolId = this.toolsByName.get(name.trim());
    if (!toolId) {
      return null;
    }
    return this.findById(toolId);
  }

  async findAll(): Promise<readonly McpTool[]> {
    return Object.freeze([...this.tools.values()]);
  }
}

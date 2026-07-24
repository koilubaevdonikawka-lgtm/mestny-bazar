import type { IMcpRequestHistoryRepository } from "@server/application/mcp-server/contracts/mcp-request-history-repository.contract";
import type { McpRequestHistoryEntry } from "@server/application/mcp-server/models/mcp.model";

/** In-memory MCP request history store. */
export class McpRequestHistoryRepository implements IMcpRequestHistoryRepository {
  private readonly entries: McpRequestHistoryEntry[] = [];

  async save(entry: McpRequestHistoryEntry): Promise<void> {
    this.entries.push(entry);
  }

  async findAll(): Promise<readonly McpRequestHistoryEntry[]> {
    return Object.freeze([...this.entries]);
  }
}

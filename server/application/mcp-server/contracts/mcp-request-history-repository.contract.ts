import type { McpRequestHistoryEntry } from "@server/application/mcp-server/models/mcp.model";

export interface IMcpRequestHistoryRepository {
  save(entry: McpRequestHistoryEntry): Promise<void>;
  findAll(): Promise<readonly McpRequestHistoryEntry[]>;
}

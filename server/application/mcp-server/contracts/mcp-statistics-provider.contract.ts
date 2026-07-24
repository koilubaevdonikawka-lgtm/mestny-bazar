import type { McpServerStatistics } from "@server/application/mcp-server/models/mcp.model";

export interface IMcpStatisticsProvider {
  recordRequest(): Promise<void>;
  getStatistics(input: {
    totalTools: number;
    activeTools: number;
    totalResources: number;
  }): Promise<McpServerStatistics>;
}

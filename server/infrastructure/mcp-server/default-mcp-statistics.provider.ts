import type { IMcpStatisticsProvider } from "@server/application/mcp-server/contracts/mcp-statistics-provider.contract";
import type { McpServerStatistics } from "@server/application/mcp-server/models/mcp.model";

/** Default in-memory MCP server statistics provider. */
export class DefaultMcpStatisticsProvider implements IMcpStatisticsProvider {
  private totalRequests = 0;

  async recordRequest(): Promise<void> {
    this.totalRequests += 1;
  }

  async getStatistics(input: {
    totalTools: number;
    activeTools: number;
    totalResources: number;
  }): Promise<McpServerStatistics> {
    return Object.freeze({
      totalTools: input.totalTools,
      activeTools: input.activeTools,
      totalResources: input.totalResources,
      totalRequests: this.totalRequests,
    });
  }
}

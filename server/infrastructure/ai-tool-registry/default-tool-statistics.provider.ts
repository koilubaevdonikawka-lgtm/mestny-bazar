import type { IToolStatisticsProvider } from "@server/application/ai-tool-registry/contracts/tool-statistics-provider.contract";
import type { ToolRegistryStatistics } from "@server/application/ai-tool-registry/models/tool.model";

/** Default in-memory tool registry statistics provider. */
export class DefaultToolStatisticsProvider implements IToolStatisticsProvider {
  async getStatistics(input: {
    totalTools: number;
    totalCategories: number;
    activeTools: number;
    inactiveTools: number;
  }): Promise<ToolRegistryStatistics> {
    return Object.freeze({
      totalTools: input.totalTools,
      totalCategories: input.totalCategories,
      activeTools: input.activeTools,
      inactiveTools: input.inactiveTools,
    });
  }
}

import type { ToolRegistryStatistics } from "@server/application/ai-tool-registry/models/tool.model";

export interface IToolStatisticsProvider {
  getStatistics(input: {
    totalTools: number;
    totalCategories: number;
    activeTools: number;
    inactiveTools: number;
  }): Promise<ToolRegistryStatistics>;
}

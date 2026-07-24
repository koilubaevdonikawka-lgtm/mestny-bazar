import type { ActionRegistryStatistics } from "@server/application/ai-action-registry/models/action.model";

export interface IActionStatisticsProvider {
  getStatistics(input: {
    totalActions: number;
    activeActions: number;
    categories: readonly string[];
  }): Promise<ActionRegistryStatistics>;
}

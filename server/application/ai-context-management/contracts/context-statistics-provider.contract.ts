import type { ContextStatistics } from "@server/application/ai-context-management/models/context.model";

export interface IContextStatisticsProvider {
  getStatistics(input: {
    totalContexts: number;
    activeContexts: number;
    categories: readonly string[];
  }): Promise<ContextStatistics>;
}

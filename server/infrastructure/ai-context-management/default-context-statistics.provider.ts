import type { IContextStatisticsProvider } from "@server/application/ai-context-management/contracts/context-statistics-provider.contract";
import type { ContextStatistics } from "@server/application/ai-context-management/models/context.model";

/** Default in-memory context statistics provider. */
export class DefaultContextStatisticsProvider implements IContextStatisticsProvider {
  async getStatistics(input: {
    totalContexts: number;
    activeContexts: number;
    categories: readonly string[];
  }): Promise<ContextStatistics> {
    return Object.freeze({
      totalContexts: input.totalContexts,
      activeContexts: input.activeContexts,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

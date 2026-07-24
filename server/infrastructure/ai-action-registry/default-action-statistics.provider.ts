import type { IActionStatisticsProvider } from "@server/application/ai-action-registry/contracts/action-statistics-provider.contract";
import type { ActionRegistryStatistics } from "@server/application/ai-action-registry/models/action.model";

/** Default in-memory action statistics provider. */
export class DefaultActionStatisticsProvider implements IActionStatisticsProvider {
  async getStatistics(input: {
    totalActions: number;
    activeActions: number;
    categories: readonly string[];
  }): Promise<ActionRegistryStatistics> {
    return Object.freeze({
      totalActions: input.totalActions,
      activeActions: input.activeActions,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

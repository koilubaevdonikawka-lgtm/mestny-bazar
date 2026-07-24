import type { IConstraintStatisticsProvider } from "@server/application/ai-constraint-registry/contracts/constraint-statistics-provider.contract";
import type { ConstraintRegistryStatistics } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Default in-memory constraint statistics provider. */
export class DefaultConstraintStatisticsProvider implements IConstraintStatisticsProvider {
  async getStatistics(input: {
    totalConstraints: number;
    activeConstraints: number;
    categories: readonly string[];
  }): Promise<ConstraintRegistryStatistics> {
    return Object.freeze({
      totalConstraints: input.totalConstraints,
      activeConstraints: input.activeConstraints,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

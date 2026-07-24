import type { ConstraintRegistryStatistics } from "@server/application/ai-constraint-registry/models/constraint.model";

export interface IConstraintStatisticsProvider {
  getStatistics(input: {
    totalConstraints: number;
    activeConstraints: number;
    categories: readonly string[];
  }): Promise<ConstraintRegistryStatistics>;
}

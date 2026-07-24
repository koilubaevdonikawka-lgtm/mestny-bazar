import type { IExecutionEnvironmentStatisticsProvider } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-statistics-provider.contract";
import type { ExecutionEnvironmentRegistryStatistics } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Default in-memory execution environment statistics provider. */
export class DefaultExecutionEnvironmentStatisticsProvider implements IExecutionEnvironmentStatisticsProvider {
  async getStatistics(input: {
    totalExecutionEnvironments: number;
    activeExecutionEnvironments: number;
    categories: readonly string[];
  }): Promise<ExecutionEnvironmentRegistryStatistics> {
    return Object.freeze({
      totalExecutionEnvironments: input.totalExecutionEnvironments,
      activeExecutionEnvironments: input.activeExecutionEnvironments,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

import type { ExecutionEnvironmentRegistryStatistics } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

export interface IExecutionEnvironmentStatisticsProvider {
  getStatistics(input: {
    totalExecutionEnvironments: number;
    activeExecutionEnvironments: number;
    categories: readonly string[];
  }): Promise<ExecutionEnvironmentRegistryStatistics>;
}

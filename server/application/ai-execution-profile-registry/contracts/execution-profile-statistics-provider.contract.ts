import type { ExecutionProfileRegistryStatistics } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

export interface IExecutionProfileStatisticsProvider {
  getStatistics(input: {
    totalExecutionProfiles: number;
    activeExecutionProfiles: number;
    categories: readonly string[];
  }): Promise<ExecutionProfileRegistryStatistics>;
}

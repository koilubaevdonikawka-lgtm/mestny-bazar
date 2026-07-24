import type { IExecutionProfileStatisticsProvider } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-statistics-provider.contract";
import type { ExecutionProfileRegistryStatistics } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Default in-memory execution profile statistics provider. */
export class DefaultExecutionProfileStatisticsProvider implements IExecutionProfileStatisticsProvider {
  async getStatistics(input: {
    totalExecutionProfiles: number;
    activeExecutionProfiles: number;
    categories: readonly string[];
  }): Promise<ExecutionProfileRegistryStatistics> {
    return Object.freeze({
      totalExecutionProfiles: input.totalExecutionProfiles,
      activeExecutionProfiles: input.activeExecutionProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

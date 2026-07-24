import type { IWorkflowStatisticsProvider } from "@server/application/ai-workflow-registry/contracts/workflow-statistics-provider.contract";
import type { WorkflowRegistryStatistics } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Default in-memory workflow statistics provider. */
export class DefaultWorkflowStatisticsProvider implements IWorkflowStatisticsProvider {
  async getStatistics(input: {
    totalWorkflows: number;
    activeWorkflows: number;
    categories: readonly string[];
  }): Promise<WorkflowRegistryStatistics> {
    return Object.freeze({
      totalWorkflows: input.totalWorkflows,
      activeWorkflows: input.activeWorkflows,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

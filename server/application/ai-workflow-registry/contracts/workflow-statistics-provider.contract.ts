import type { WorkflowRegistryStatistics } from "@server/application/ai-workflow-registry/models/workflow.model";

export interface IWorkflowStatisticsProvider {
  getStatistics(input: {
    totalWorkflows: number;
    activeWorkflows: number;
    categories: readonly string[];
  }): Promise<WorkflowRegistryStatistics>;
}

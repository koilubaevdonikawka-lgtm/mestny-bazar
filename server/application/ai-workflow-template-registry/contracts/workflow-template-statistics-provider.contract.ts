import type { WorkflowTemplateRegistryStatistics } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

export interface IWorkflowTemplateStatisticsProvider {
  getStatistics(input: {
    totalWorkflowTemplates: number;
    activeWorkflowTemplates: number;
    categories: readonly string[];
  }): Promise<WorkflowTemplateRegistryStatistics>;
}

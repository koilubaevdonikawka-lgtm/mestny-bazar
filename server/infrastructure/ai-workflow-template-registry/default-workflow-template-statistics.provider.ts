import type { IWorkflowTemplateStatisticsProvider } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-statistics-provider.contract";
import type { WorkflowTemplateRegistryStatistics } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Default in-memory workflow template statistics provider. */
export class DefaultWorkflowTemplateStatisticsProvider implements IWorkflowTemplateStatisticsProvider {
  async getStatistics(input: {
    totalWorkflowTemplates: number;
    activeWorkflowTemplates: number;
    categories: readonly string[];
  }): Promise<WorkflowTemplateRegistryStatistics> {
    return Object.freeze({
      totalWorkflowTemplates: input.totalWorkflowTemplates,
      activeWorkflowTemplates: input.activeWorkflowTemplates,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}

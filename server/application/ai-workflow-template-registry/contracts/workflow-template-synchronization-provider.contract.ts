import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Future integration point for workflow template synchronization. Not wired yet. */
export interface IWorkflowTemplateSynchronizationProvider {
  synchronize(workflowTemplates: readonly WorkflowTemplate[]): Promise<void>;
}

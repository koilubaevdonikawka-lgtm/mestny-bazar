import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Future integration point for workflow template export. Not wired yet. */
export interface IWorkflowTemplateExportProvider {
  exportTo(workflowTemplates: readonly WorkflowTemplate[]): Promise<string>;
}

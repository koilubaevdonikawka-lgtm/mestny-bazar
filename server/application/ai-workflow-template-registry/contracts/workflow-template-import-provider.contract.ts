import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Future integration point for workflow template import. Not wired yet. */
export interface IWorkflowTemplateImportProvider {
  importFrom(source: string): Promise<readonly WorkflowTemplate[]>;
}

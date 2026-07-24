import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Future integration point for workflow template version management. Not wired yet. */
export interface IWorkflowTemplateVersionProvider {
  listVersions(workflowTemplateId: string): Promise<readonly WorkflowTemplate[]>;
  getVersion(workflowTemplateId: string, version: string): Promise<WorkflowTemplate | null>;
}

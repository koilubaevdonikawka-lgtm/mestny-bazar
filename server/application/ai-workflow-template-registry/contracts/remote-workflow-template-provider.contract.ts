import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Future integration point for external workflow template providers. Not wired yet. */
export interface IRemoteWorkflowTemplateProvider {
  fetchRemote(workflowTemplateId: string): Promise<WorkflowTemplate | null>;
  pushRemote(workflowTemplate: WorkflowTemplate): Promise<void>;
}

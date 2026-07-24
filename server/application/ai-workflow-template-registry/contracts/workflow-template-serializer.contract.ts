import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

export interface IWorkflowTemplateSerializer {
  serialize(workflowTemplate: WorkflowTemplate): Promise<string>;
  deserialize(serialized: string): Promise<WorkflowTemplate>;
}

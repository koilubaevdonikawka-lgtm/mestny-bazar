import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

export interface IWorkflowTemplateCatalog {
  register(workflowTemplate: WorkflowTemplate): Promise<void>;
  remove(workflowTemplateId: string): Promise<void>;
  findById(workflowTemplateId: string): Promise<WorkflowTemplate | null>;
  findByName(name: string): Promise<WorkflowTemplate | null>;
  findByCategory(category: string): Promise<readonly WorkflowTemplate[]>;
  listAll(): Promise<readonly WorkflowTemplate[]>;
}

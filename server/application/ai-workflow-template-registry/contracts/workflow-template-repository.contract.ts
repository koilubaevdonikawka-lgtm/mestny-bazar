import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

export interface IWorkflowTemplateRepository {
  save(workflowTemplate: WorkflowTemplate): Promise<void>;
  findById(workflowTemplateId: string): Promise<WorkflowTemplate | null>;
  findByName(name: string): Promise<WorkflowTemplate | null>;
  findByCategory(category: string): Promise<readonly WorkflowTemplate[]>;
  findAll(): Promise<readonly WorkflowTemplate[]>;
  delete(workflowTemplateId: string): Promise<boolean>;
}

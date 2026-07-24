import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

export interface IWorkflowRepository {
  save(workflow: Workflow): Promise<void>;
  findById(workflowId: string): Promise<Workflow | null>;
  findByName(name: string): Promise<Workflow | null>;
  findByCategory(category: string): Promise<readonly Workflow[]>;
  findAll(): Promise<readonly Workflow[]>;
  delete(workflowId: string): Promise<boolean>;
}

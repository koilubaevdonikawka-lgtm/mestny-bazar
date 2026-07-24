import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

export interface IWorkflowCatalog {
  register(workflow: Workflow): Promise<void>;
  remove(workflowId: string): Promise<void>;
  findById(workflowId: string): Promise<Workflow | null>;
  findByName(name: string): Promise<Workflow | null>;
  findByCategory(category: string): Promise<readonly Workflow[]>;
  listAll(): Promise<readonly Workflow[]>;
}

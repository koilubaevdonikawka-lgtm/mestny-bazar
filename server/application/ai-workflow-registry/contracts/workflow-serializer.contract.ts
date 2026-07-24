import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

export interface IWorkflowSerializer {
  serialize(workflow: Workflow): Promise<string>;
  deserialize(serialized: string): Promise<Workflow>;
}

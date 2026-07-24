import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Future integration point for external workflow providers. Not wired yet. */
export interface IRemoteWorkflowProvider {
  fetchRemote(workflowId: string): Promise<Workflow | null>;
  pushRemote(workflow: Workflow): Promise<void>;
}

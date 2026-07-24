import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Future integration point for workflow execution engines. Not wired yet. */
export interface IWorkflowExecutionProvider {
  execute(workflow: Workflow, input?: Record<string, unknown>): Promise<unknown>;
}

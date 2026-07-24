import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Future integration point for workflow synchronization. Not wired yet. */
export interface IWorkflowSynchronizationProvider {
  synchronize(workflows: readonly Workflow[]): Promise<void>;
}

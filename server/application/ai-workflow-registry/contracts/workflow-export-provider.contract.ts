import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Future integration point for workflow export. Not wired yet. */
export interface IWorkflowExportProvider {
  exportTo(workflows: readonly Workflow[]): Promise<string>;
}

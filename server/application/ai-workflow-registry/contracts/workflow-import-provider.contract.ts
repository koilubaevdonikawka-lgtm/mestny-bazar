import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** Future integration point for workflow import. Not wired yet. */
export interface IWorkflowImportProvider {
  importFrom(source: string): Promise<readonly Workflow[]>;
}

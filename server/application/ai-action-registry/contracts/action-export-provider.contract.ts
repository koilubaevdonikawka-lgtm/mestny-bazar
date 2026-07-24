import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Future integration point for action export. Not wired yet. */
export interface IActionExportProvider {
  exportTo(actions: readonly Action[]): Promise<string>;
}

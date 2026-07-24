import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Future integration point for action import. Not wired yet. */
export interface IActionImportProvider {
  importFrom(source: string): Promise<readonly Action[]>;
}

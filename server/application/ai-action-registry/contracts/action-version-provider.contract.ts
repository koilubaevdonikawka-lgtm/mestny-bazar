import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Future integration point for action version management. Not wired yet. */
export interface IActionVersionProvider {
  listVersions(actionId: string): Promise<readonly Action[]>;
  getVersion(actionId: string, version: string): Promise<Action | null>;
}

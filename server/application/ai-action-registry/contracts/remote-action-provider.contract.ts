import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Future integration point for external action providers. Not wired yet. */
export interface IRemoteActionProvider {
  fetchRemote(actionId: string): Promise<Action | null>;
  pushRemote(action: Action): Promise<void>;
}

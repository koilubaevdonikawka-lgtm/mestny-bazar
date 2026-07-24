import type { Action } from "@server/application/ai-action-registry/models/action.model";

/** Future integration point for action synchronization. Not wired yet. */
export interface IActionSynchronizationProvider {
  synchronize(actions: readonly Action[]): Promise<void>;
}

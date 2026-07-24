import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Future integration point for external context providers. Not wired yet. */
export interface IRemoteContextProvider {
  fetchRemote(contextId: string): Promise<Context | null>;
  pushRemote(context: Context): Promise<void>;
}

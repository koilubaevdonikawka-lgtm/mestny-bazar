import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Future integration point for external context storage. Not wired yet. */
export interface IContextStorageProvider {
  store(context: Context): Promise<void>;
  retrieve(contextId: string): Promise<Context | null>;
}

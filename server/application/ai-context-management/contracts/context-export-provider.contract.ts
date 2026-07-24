import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Future integration point for context export. Not wired yet. */
export interface IContextExportProvider {
  exportContext(context: Context): Promise<string>;
  exportAll(contexts: readonly Context[]): Promise<string>;
}

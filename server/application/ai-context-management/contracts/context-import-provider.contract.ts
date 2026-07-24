import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Future integration point for context import. Not wired yet. */
export interface IContextImportProvider {
  importFromSource(source: string): Promise<readonly Context[]>;
}

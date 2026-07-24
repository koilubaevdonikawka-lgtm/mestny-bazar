import type { Context } from "@server/application/ai-context-management/models/context.model";

/** Future integration point for context merging. Not wired yet. */
export interface IContextMergeProvider {
  merge(contexts: readonly Context[]): Promise<Context>;
}

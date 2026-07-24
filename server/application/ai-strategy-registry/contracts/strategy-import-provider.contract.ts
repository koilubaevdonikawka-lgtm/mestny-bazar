import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Future integration point for strategy import. Not wired yet. */
export interface IStrategyImportProvider {
  importFrom(source: string): Promise<readonly Strategy[]>;
}

import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Future integration point for strategy export. Not wired yet. */
export interface IStrategyExportProvider {
  exportTo(strategies: readonly Strategy[]): Promise<string>;
}

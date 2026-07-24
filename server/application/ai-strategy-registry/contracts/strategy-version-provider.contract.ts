import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Future integration point for strategy version management. Not wired yet. */
export interface IStrategyVersionProvider {
  listVersions(strategyId: string): Promise<readonly Strategy[]>;
  getVersion(strategyId: string, version: string): Promise<Strategy | null>;
}

import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Future integration point for external strategy providers. Not wired yet. */
export interface IRemoteStrategyProvider {
  fetchRemote(strategyId: string): Promise<Strategy | null>;
  pushRemote(strategy: Strategy): Promise<void>;
}

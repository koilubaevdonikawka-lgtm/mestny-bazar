import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Future integration point for strategy synchronization. Not wired yet. */
export interface IStrategySynchronizationProvider {
  synchronize(strategies: readonly Strategy[]): Promise<void>;
}

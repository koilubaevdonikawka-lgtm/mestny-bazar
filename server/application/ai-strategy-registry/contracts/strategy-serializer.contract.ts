import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

export interface IStrategySerializer {
  serialize(strategy: Strategy): Promise<string>;
  deserialize(serialized: string): Promise<Strategy>;
}

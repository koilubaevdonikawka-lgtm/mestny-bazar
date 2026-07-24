import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

export interface IStrategyCatalog {
  register(strategy: Strategy): Promise<void>;
  remove(strategyId: string): Promise<void>;
  findById(strategyId: string): Promise<Strategy | null>;
  findByName(name: string): Promise<Strategy | null>;
  findByCategory(category: string): Promise<readonly Strategy[]>;
  listAll(): Promise<readonly Strategy[]>;
}

import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

export interface IStrategyRepository {
  save(strategy: Strategy): Promise<void>;
  findById(strategyId: string): Promise<Strategy | null>;
  findByName(name: string): Promise<Strategy | null>;
  findByCategory(category: string): Promise<readonly Strategy[]>;
  findAll(): Promise<readonly Strategy[]>;
  delete(strategyId: string): Promise<boolean>;
}

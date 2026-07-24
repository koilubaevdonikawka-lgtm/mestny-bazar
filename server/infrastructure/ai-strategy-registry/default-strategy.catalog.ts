import type { IStrategyCatalog } from "@server/application/ai-strategy-registry/contracts/strategy-catalog.contract";
import type { Strategy } from "@server/application/ai-strategy-registry/models/strategy.model";

/** Default in-memory strategy catalog index. */
export class DefaultStrategyCatalog implements IStrategyCatalog {
  private readonly strategies = new Map<string, Strategy>();
  private readonly strategiesByName = new Map<string, string>();
  private readonly strategiesByCategory = new Map<string, Set<string>>();

  async register(strategy: Strategy): Promise<void> {
    const existing = this.strategies.get(strategy.strategyId);
    if (existing) {
      if (existing.name !== strategy.name) {
        this.strategiesByName.delete(existing.name);
      }
      if (existing.category !== strategy.category) {
        this.removeFromCategory(existing.category, existing.strategyId);
      }
    }

    this.strategies.set(strategy.strategyId, strategy);
    this.strategiesByName.set(strategy.name, strategy.strategyId);
    this.addToCategory(strategy.category, strategy.strategyId);
  }

  async remove(strategyId: string): Promise<void> {
    const strategy = this.strategies.get(strategyId.trim());
    if (!strategy) {
      return;
    }
    this.strategies.delete(strategy.strategyId);
    this.strategiesByName.delete(strategy.name);
    this.removeFromCategory(strategy.category, strategy.strategyId);
  }

  async findById(strategyId: string): Promise<Strategy | null> {
    return this.strategies.get(strategyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Strategy | null> {
    const strategyId = this.strategiesByName.get(name.trim());
    if (!strategyId) {
      return null;
    }
    return this.strategies.get(strategyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Strategy[]> {
    const strategyIds = this.strategiesByCategory.get(category.trim());
    if (!strategyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...strategyIds]
        .map((strategyId) => this.strategies.get(strategyId))
        .filter((strategy): strategy is Strategy => strategy !== undefined),
    );
  }

  async listAll(): Promise<readonly Strategy[]> {
    return Object.freeze([...this.strategies.values()]);
  }

  private addToCategory(category: string, strategyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.strategiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(strategyId);
    this.strategiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, strategyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.strategiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(strategyId);
    if (categorySet.size === 0) {
      this.strategiesByCategory.delete(normalizedCategory);
    }
  }
}

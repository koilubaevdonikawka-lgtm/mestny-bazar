/**
 * AI Strategy Registry — unified registry for AI strategies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IStrategyCatalog } from "@server/application/ai-strategy-registry/contracts/strategy-catalog.contract";
import type { IStrategyRepository } from "@server/application/ai-strategy-registry/contracts/strategy-repository.contract";
import type { IStrategySerializer } from "@server/application/ai-strategy-registry/contracts/strategy-serializer.contract";
import type { IStrategyStatisticsProvider } from "@server/application/ai-strategy-registry/contracts/strategy-statistics-provider.contract";
import type { IStrategyValidator } from "@server/application/ai-strategy-registry/contracts/strategy-validator.contract";
import {
  createStrategy,
  type DeleteStrategyResult,
  type FindStrategyByNameResult,
  type ListStrategiesByCategoryResult,
  type ListStrategiesResult,
  type RegisterStrategyInput,
  type Strategy,
  type StrategyRegistryStatistics,
  type UpdateStrategyInput,
} from "@server/application/ai-strategy-registry/models/strategy.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiStrategyRegistryService {
  constructor(
    private readonly strategyRepository: IStrategyRepository,
    private readonly strategyCatalog: IStrategyCatalog,
    private readonly strategyValidator: IStrategyValidator,
    private readonly strategySerializer: IStrategySerializer,
    private readonly statisticsProvider: IStrategyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerStrategy(input: RegisterStrategyInput): Promise<Strategy> {
    const validation = await this.strategyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.strategyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Strategy already exists with name: ${input.name.trim()}`);
    }

    const strategy = createStrategy({
      strategyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.strategyRepository.save(strategy);
    await this.strategyCatalog.register(strategy);
    return strategy;
  }

  async getStrategy(strategyId: string): Promise<Strategy | null> {
    return this.strategyRepository.findById(strategyId.trim());
  }

  async listStrategies(): Promise<ListStrategiesResult> {
    const strategies = Object.freeze(
      [...(await this.strategyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ strategies, total: strategies.length });
  }

  async updateStrategy(input: UpdateStrategyInput): Promise<Strategy> {
    const strategyId = input.strategyId.trim();
    const existing = await this.strategyRepository.findById(strategyId);
    if (!existing) {
      throw new Error(`Strategy not found: ${strategyId}`);
    }

    const validation = await this.strategyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.strategyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.strategyId !== existing.strategyId) {
        throw new Error(`Strategy already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createStrategy({
      strategyId: existing.strategyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.strategyRepository.save(updated);
    await this.strategyCatalog.register(updated);
    return updated;
  }

  async deleteStrategy(strategyId: string): Promise<DeleteStrategyResult> {
    const normalizedStrategyId = strategyId.trim();
    const deleted = await this.strategyRepository.delete(normalizedStrategyId);
    if (deleted) {
      await this.strategyCatalog.remove(normalizedStrategyId);
    }
    return Object.freeze({ strategyId: normalizedStrategyId, deleted });
  }

  async findStrategyByName(name: string): Promise<FindStrategyByNameResult> {
    const normalizedName = name.trim();
    const strategy = await this.strategyRepository.findByName(normalizedName);
    return Object.freeze({ strategy });
  }

  async listStrategiesByCategory(category: string): Promise<ListStrategiesByCategoryResult> {
    const normalizedCategory = category.trim();
    const strategies = Object.freeze(
      [...(await this.strategyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      strategies,
      total: strategies.length,
      category: normalizedCategory,
    });
  }

  async getStrategyRegistryStatistics(): Promise<StrategyRegistryStatistics> {
    const strategies = await this.strategyRepository.findAll();
    const activeStrategies = strategies.filter((strategy) => strategy.status === "active").length;
    const categories = Object.freeze([
      ...new Set(strategies.map((strategy) => strategy.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalStrategies: strategies.length,
      activeStrategies,
      categories,
    });
  }

  async serializeStrategy(strategy: Strategy): Promise<string> {
    return this.strategySerializer.serialize(strategy);
  }

  async deserializeStrategy(serialized: string): Promise<Strategy> {
    return this.strategySerializer.deserialize(serialized);
  }
}

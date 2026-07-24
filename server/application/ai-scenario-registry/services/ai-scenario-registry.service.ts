/**
 * AI Scenario Registry — unified registry for AI scenarios.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IScenarioCatalog } from "@server/application/ai-scenario-registry/contracts/scenario-catalog.contract";
import type { IScenarioRepository } from "@server/application/ai-scenario-registry/contracts/scenario-repository.contract";
import type { IScenarioSerializer } from "@server/application/ai-scenario-registry/contracts/scenario-serializer.contract";
import type { IScenarioStatisticsProvider } from "@server/application/ai-scenario-registry/contracts/scenario-statistics-provider.contract";
import type { IScenarioValidator } from "@server/application/ai-scenario-registry/contracts/scenario-validator.contract";
import {
  createScenario,
  type DeleteScenarioResult,
  type FindScenarioByNameResult,
  type ListScenariosByCategoryResult,
  type ListScenariosResult,
  type RegisterScenarioInput,
  type Scenario,
  type ScenarioRegistryStatistics,
  type UpdateScenarioInput,
} from "@server/application/ai-scenario-registry/models/scenario.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiScenarioRegistryService {
  constructor(
    private readonly scenarioRepository: IScenarioRepository,
    private readonly scenarioCatalog: IScenarioCatalog,
    private readonly scenarioValidator: IScenarioValidator,
    private readonly scenarioSerializer: IScenarioSerializer,
    private readonly statisticsProvider: IScenarioStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerScenario(input: RegisterScenarioInput): Promise<Scenario> {
    const validation = await this.scenarioValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.scenarioRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Scenario already exists with name: ${input.name.trim()}`);
    }

    const scenario = createScenario({
      scenarioId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.scenarioRepository.save(scenario);
    await this.scenarioCatalog.register(scenario);
    return scenario;
  }

  async getScenario(scenarioId: string): Promise<Scenario | null> {
    return this.scenarioRepository.findById(scenarioId.trim());
  }

  async listScenarios(): Promise<ListScenariosResult> {
    const scenarios = Object.freeze(
      [...(await this.scenarioRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ scenarios, total: scenarios.length });
  }

  async updateScenario(input: UpdateScenarioInput): Promise<Scenario> {
    const scenarioId = input.scenarioId.trim();
    const existing = await this.scenarioRepository.findById(scenarioId);
    if (!existing) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const validation = await this.scenarioValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.scenarioRepository.findByName(input.name.trim());
      if (duplicate && duplicate.scenarioId !== existing.scenarioId) {
        throw new Error(`Scenario already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createScenario({
      scenarioId: existing.scenarioId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.scenarioRepository.save(updated);
    await this.scenarioCatalog.register(updated);
    return updated;
  }

  async deleteScenario(scenarioId: string): Promise<DeleteScenarioResult> {
    const normalizedScenarioId = scenarioId.trim();
    const deleted = await this.scenarioRepository.delete(normalizedScenarioId);
    if (deleted) {
      await this.scenarioCatalog.remove(normalizedScenarioId);
    }
    return Object.freeze({ scenarioId: normalizedScenarioId, deleted });
  }

  async findScenarioByName(name: string): Promise<FindScenarioByNameResult> {
    const normalizedName = name.trim();
    const scenario = await this.scenarioRepository.findByName(normalizedName);
    return Object.freeze({ scenario });
  }

  async listScenariosByCategory(category: string): Promise<ListScenariosByCategoryResult> {
    const normalizedCategory = category.trim();
    const scenarios = Object.freeze(
      [...(await this.scenarioRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      scenarios,
      total: scenarios.length,
      category: normalizedCategory,
    });
  }

  async getScenarioRegistryStatistics(): Promise<ScenarioRegistryStatistics> {
    const scenarios = await this.scenarioRepository.findAll();
    const activeScenarios = scenarios.filter(
      (scenario) => scenario.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(scenarios.map((scenario) => scenario.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalScenarios: scenarios.length,
      activeScenarios,
      categories,
    });
  }

  async serializeScenario(scenario: Scenario): Promise<string> {
    return this.scenarioSerializer.serialize(scenario);
  }

  async deserializeScenario(serialized: string): Promise<Scenario> {
    return this.scenarioSerializer.deserialize(serialized);
  }
}

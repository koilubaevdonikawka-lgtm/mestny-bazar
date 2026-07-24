import type { IScenarioRepository } from "@server/application/ai-scenario-registry/contracts/scenario-repository.contract";
import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** In-memory scenario store. */
export class ScenarioRepository implements IScenarioRepository {
  private readonly scenarios = new Map<string, Scenario>();
  private readonly scenariosByName = new Map<string, string>();
  private readonly scenariosByCategory = new Map<string, Set<string>>();

  async save(scenario: Scenario): Promise<void> {
    const existing = this.scenarios.get(scenario.scenarioId);
    if (existing) {
      if (existing.name !== scenario.name) {
        this.scenariosByName.delete(existing.name);
      }
      if (existing.category !== scenario.category) {
        this.removeFromCategory(existing.category, existing.scenarioId);
      }
    }

    this.scenarios.set(scenario.scenarioId, scenario);
    this.scenariosByName.set(scenario.name, scenario.scenarioId);
    this.addToCategory(scenario.category, scenario.scenarioId);
  }

  async findById(scenarioId: string): Promise<Scenario | null> {
    return this.scenarios.get(scenarioId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Scenario | null> {
    const scenarioId = this.scenariosByName.get(name.trim());
    if (!scenarioId) {
      return null;
    }
    return this.scenarios.get(scenarioId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Scenario[]> {
    const scenarioIds = this.scenariosByCategory.get(category.trim());
    if (!scenarioIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...scenarioIds]
        .map((scenarioId) => this.scenarios.get(scenarioId))
        .filter((scenario): scenario is Scenario => scenario !== undefined),
    );
  }

  async findAll(): Promise<readonly Scenario[]> {
    return Object.freeze([...this.scenarios.values()]);
  }

  async delete(scenarioId: string): Promise<boolean> {
    const scenario = await this.findById(scenarioId);
    if (!scenario) {
      return false;
    }
    this.scenarios.delete(scenario.scenarioId);
    this.scenariosByName.delete(scenario.name);
    this.removeFromCategory(scenario.category, scenario.scenarioId);
    return true;
  }

  private addToCategory(category: string, scenarioId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.scenariosByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(scenarioId);
    this.scenariosByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, scenarioId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.scenariosByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(scenarioId);
    if (categorySet.size === 0) {
      this.scenariosByCategory.delete(normalizedCategory);
    }
  }
}

import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

export interface IScenarioRepository {
  save(scenario: Scenario): Promise<void>;
  findById(scenarioId: string): Promise<Scenario | null>;
  findByName(name: string): Promise<Scenario | null>;
  findByCategory(category: string): Promise<readonly Scenario[]>;
  findAll(): Promise<readonly Scenario[]>;
  delete(scenarioId: string): Promise<boolean>;
}

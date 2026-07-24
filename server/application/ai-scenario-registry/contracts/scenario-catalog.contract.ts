import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

export interface IScenarioCatalog {
  register(scenario: Scenario): Promise<void>;
  remove(scenarioId: string): Promise<void>;
  findById(scenarioId: string): Promise<Scenario | null>;
  findByName(name: string): Promise<Scenario | null>;
  findByCategory(category: string): Promise<readonly Scenario[]>;
  listAll(): Promise<readonly Scenario[]>;
}

import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

export interface IScenarioSerializer {
  serialize(scenario: Scenario): Promise<string>;
  deserialize(serialized: string): Promise<Scenario>;
}

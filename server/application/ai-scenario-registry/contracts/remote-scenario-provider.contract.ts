import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Future integration point for external scenario providers. Not wired yet. */
export interface IRemoteScenarioProvider {
  fetchRemote(scenarioId: string): Promise<Scenario | null>;
  pushRemote(scenario: Scenario): Promise<void>;
}

import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Future integration point for scenario synchronization. Not wired yet. */
export interface IScenarioSynchronizationProvider {
  synchronize(scenarios: readonly Scenario[]): Promise<void>;
}

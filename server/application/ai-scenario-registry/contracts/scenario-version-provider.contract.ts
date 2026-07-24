import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Future integration point for scenario version management. Not wired yet. */
export interface IScenarioVersionProvider {
  listVersions(scenarioId: string): Promise<readonly Scenario[]>;
  getVersion(scenarioId: string, version: string): Promise<Scenario | null>;
}

import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Future integration point for scenario export. Not wired yet. */
export interface IScenarioExportProvider {
  exportTo(scenarios: readonly Scenario[]): Promise<string>;
}

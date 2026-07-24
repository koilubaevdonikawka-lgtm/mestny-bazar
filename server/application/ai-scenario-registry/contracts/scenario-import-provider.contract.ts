import type { Scenario } from "@server/application/ai-scenario-registry/models/scenario.model";

/** Future integration point for scenario import. Not wired yet. */
export interface IScenarioImportProvider {
  importFrom(source: string): Promise<readonly Scenario[]>;
}

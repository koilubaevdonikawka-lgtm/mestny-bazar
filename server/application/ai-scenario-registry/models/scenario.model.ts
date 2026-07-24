/** Registered AI scenario — generic scenario metadata only, no domain knowledge. */
export interface Scenario {
  readonly scenarioId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterScenarioInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateScenarioInput {
  readonly scenarioId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListScenariosResult {
  readonly scenarios: readonly Scenario[];
  readonly total: number;
}

export interface FindScenarioByNameResult {
  readonly scenario: Scenario | null;
}

export interface ListScenariosByCategoryResult {
  readonly scenarios: readonly Scenario[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteScenarioResult {
  readonly scenarioId: string;
  readonly deleted: boolean;
}

export interface ScenarioRegistryStatistics {
  readonly totalScenarios: number;
  readonly activeScenarios: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createScenario(input: {
  scenarioId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Scenario {
  const now = new Date().toISOString();
  return Object.freeze({
    scenarioId: input.scenarioId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

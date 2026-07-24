export type ScenarioStatus = "passed" | "failed" | "skipped";

export interface ScenarioStepResult {
  readonly name: string;
  readonly passed: boolean;
  readonly message?: string;
}

export interface ScenarioReport {
  readonly scenarioId: string;
  readonly scenarioName: string;
  readonly category: string;
  readonly status: ScenarioStatus;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly durationMs: number;
  readonly steps: readonly ScenarioStepResult[];
  readonly error?: string;
}

export interface ExecutionSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly durationMs: number;
}

export interface TestReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly summary: ExecutionSummary;
  readonly scenarios: readonly ScenarioReport[];
}

export function createScenarioReport(input: {
  scenarioId: string;
  scenarioName: string;
  category: string;
  status: ScenarioStatus;
  startedAt: string;
  finishedAt: string;
  steps?: readonly ScenarioStepResult[];
  error?: string;
}): ScenarioReport {
  const started = Date.parse(input.startedAt);
  const finished = Date.parse(input.finishedAt);
  return Object.freeze({
    scenarioId: input.scenarioId,
    scenarioName: input.scenarioName,
    category: input.category,
    status: input.status,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    durationMs: Math.max(0, finished - started),
    steps: Object.freeze([...(input.steps ?? [])]),
    error: input.error?.trim() || undefined,
  });
}

export function createExecutionSummary(
  scenarios: readonly ScenarioReport[],
): ExecutionSummary {
  const durationMs = scenarios.reduce((total, scenario) => total + scenario.durationMs, 0);
  return Object.freeze({
    total: scenarios.length,
    passed: scenarios.filter((scenario) => scenario.status === "passed").length,
    failed: scenarios.filter((scenario) => scenario.status === "failed").length,
    skipped: scenarios.filter((scenario) => scenario.status === "skipped").length,
    durationMs,
  });
}

export function createTestReport(input: {
  id: string;
  scenarios: readonly ScenarioReport[];
}): TestReport {
  return Object.freeze({
    id: input.id,
    generatedAt: new Date().toISOString(),
    summary: createExecutionSummary(input.scenarios),
    scenarios: Object.freeze([...input.scenarios]),
  });
}

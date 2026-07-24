export const ScenarioFinishedEventName = "platform.testing.scenario.finished";

export interface ScenarioFinishedEvent {
  readonly name: typeof ScenarioFinishedEventName;
  readonly occurredAt: string;
  readonly scenarioId: string;
  readonly durationMs: number;
  readonly status: "passed" | "failed" | "skipped";
}

export function createScenarioFinishedEvent(input: {
  scenarioId: string;
  durationMs: number;
  status: ScenarioFinishedEvent["status"];
}): ScenarioFinishedEvent {
  return Object.freeze({
    name: ScenarioFinishedEventName,
    occurredAt: new Date().toISOString(),
    scenarioId: input.scenarioId.trim(),
    durationMs: input.durationMs,
    status: input.status,
  });
}

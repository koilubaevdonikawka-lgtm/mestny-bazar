export const ScenarioFailedEventName = "platform.testing.scenario.failed";

export interface ScenarioFailedEvent {
  readonly name: typeof ScenarioFailedEventName;
  readonly occurredAt: string;
  readonly scenarioId: string;
  readonly error: string;
}

export function createScenarioFailedEvent(input: {
  scenarioId: string;
  error: string;
}): ScenarioFailedEvent {
  return Object.freeze({
    name: ScenarioFailedEventName,
    occurredAt: new Date().toISOString(),
    scenarioId: input.scenarioId.trim(),
    error: input.error.trim(),
  });
}

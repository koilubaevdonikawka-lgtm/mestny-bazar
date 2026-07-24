export const ScenarioStartedEventName = "platform.testing.scenario.started";

export interface ScenarioStartedEvent {
  readonly name: typeof ScenarioStartedEventName;
  readonly occurredAt: string;
  readonly scenarioId: string;
  readonly scenarioName: string;
}

export function createScenarioStartedEvent(input: {
  scenarioId: string;
  scenarioName: string;
}): ScenarioStartedEvent {
  return Object.freeze({
    name: ScenarioStartedEventName,
    occurredAt: new Date().toISOString(),
    scenarioId: input.scenarioId.trim(),
    scenarioName: input.scenarioName.trim(),
  });
}

import type { ScenarioReport } from "@server/platform/testing/testing/models";
import { createScenarioReport } from "@server/platform/testing/testing/models";
import type { ITestRunner, ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";
import {
  createScenarioFailedEvent,
  createScenarioFinishedEvent,
  createScenarioStartedEvent,
} from "@server/platform/testing/testing/events";

/** Executes registered end-to-end scenarios. */
export class ScenarioRunner implements ITestRunner {
  private readonly scenarios = new Map<string, ITestScenario>();

  register(scenario: ITestScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  list(): readonly ITestScenario[] {
    return Object.freeze([...this.scenarios.values()]);
  }

  async run(scenarioId: string, context: TestExecutionContext): Promise<ScenarioReport> {
    const scenario = this.scenarios.get(scenarioId.trim());
    if (!scenario) {
      throw new Error(`Scenario "${scenarioId}" is not registered.`);
    }

    const startedAt = new Date().toISOString();
    createScenarioStartedEvent({ scenarioId: scenario.id, scenarioName: scenario.name });

    try {
      await scenario.run(context);
      const finishedAt = new Date().toISOString();
      const report = createScenarioReport({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        category: scenario.category,
        status: "passed",
        startedAt,
        finishedAt,
      });
      createScenarioFinishedEvent({
        scenarioId: scenario.id,
        durationMs: report.durationMs,
        status: "passed",
      });
      return report;
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      createScenarioFailedEvent({ scenarioId: scenario.id, error: message });
      const report = createScenarioReport({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        category: scenario.category,
        status: "failed",
        startedAt,
        finishedAt,
        error: message,
      });
      createScenarioFinishedEvent({
        scenarioId: scenario.id,
        durationMs: report.durationMs,
        status: "failed",
      });
      return report;
    }
  }

  async runAll(context: TestExecutionContext): Promise<readonly ScenarioReport[]> {
    const reports: ScenarioReport[] = [];
    for (const scenario of this.scenarios.values()) {
      reports.push(await this.run(scenario.id, context));
    }
    return Object.freeze(reports);
  }
}

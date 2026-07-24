import type { ScenarioReport } from "@server/platform/testing/testing/models";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";
import type { ITestScenario } from "@server/platform/testing/testing/contracts/test-scenario.contract";

/** Contract for running test scenarios. */
export interface ITestRunner {
  register(scenario: ITestScenario): void;
  run(scenarioId: string, context: TestExecutionContext): Promise<ScenarioReport>;
  runAll(context: TestExecutionContext): Promise<readonly ScenarioReport[]>;
  list(): readonly ITestScenario[];
}

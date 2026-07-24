import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

/** Contract for an executable end-to-end test scenario. */
export interface ITestScenario {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  run(context: TestExecutionContext): Promise<void>;
}

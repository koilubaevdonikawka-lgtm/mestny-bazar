import type { ScenarioReport, TestReport } from "@server/platform/testing/testing/models";
import { createTestReport } from "@server/platform/testing/testing/models";

/** Builds structured test reports from scenario execution results. */
export class ReportGenerator {
  generate(scenarios: readonly ScenarioReport[]): TestReport {
    return createTestReport({
      id: `test-report-${Date.now()}`,
      scenarios,
    });
  }
}

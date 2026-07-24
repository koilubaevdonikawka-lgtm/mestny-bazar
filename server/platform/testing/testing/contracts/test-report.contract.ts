import type { TestReport } from "@server/platform/testing/testing/models";

/** Contract for generated test reports. */
export interface ITestReport {
  readonly report: TestReport;
}

import type { CompatibilityReport } from "@server/platform/evolution/evolution/models";

/** Contract for platform compatibility assessment. */
export interface ICompatibilityEngine {
  assess(targetVersion: string): Promise<CompatibilityReport> | CompatibilityReport;
}

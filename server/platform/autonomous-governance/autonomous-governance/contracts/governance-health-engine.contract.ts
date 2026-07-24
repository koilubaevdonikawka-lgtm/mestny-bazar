import type { PlatformHealthReport } from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for governance health calculation. */
export interface IGovernanceHealthEngine {
  calculate(): PlatformHealthReport;
}

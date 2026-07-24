import type { PlatformMonitoringSnapshot } from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for platform monitoring (metadata only). */
export interface IPlatformMonitoringEngine {
  collect(): PlatformMonitoringSnapshot;
}

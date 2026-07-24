import type { PlatformCoordinationResult } from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for platform coordination (metadata only, no side effects). */
export interface IPlatformCoordinationEngine {
  coordinate(): PlatformCoordinationResult;
}

import type { PlatformCoordinationResult } from "@server/platform/autonomous-governance/autonomous-governance/models";

export interface PlatformCoordinatedEvent {
  readonly type: "autonomous-governance.platform.coordinated";
  readonly result: PlatformCoordinationResult;
}

export function createPlatformCoordinatedEvent(
  result: PlatformCoordinationResult,
): PlatformCoordinatedEvent {
  return Object.freeze({ type: "autonomous-governance.platform.coordinated", result });
}

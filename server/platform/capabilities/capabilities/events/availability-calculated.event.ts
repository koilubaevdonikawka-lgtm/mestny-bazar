import type { CapabilityAvailability } from "@server/platform/capabilities/capabilities/models";

export interface AvailabilityCalculatedEvent {
  readonly type: "capabilities.availability.calculated";
  readonly availability: CapabilityAvailability;
}

export function createAvailabilityCalculatedEvent(
  availability: CapabilityAvailability,
): AvailabilityCalculatedEvent {
  return Object.freeze({ type: "capabilities.availability.calculated", availability });
}

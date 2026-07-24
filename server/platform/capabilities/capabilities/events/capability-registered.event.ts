import type { CapabilityDescriptor } from "@server/platform/capabilities/capabilities/models";

export interface CapabilityRegisteredEvent {
  readonly type: "capabilities.capability.registered";
  readonly capability: CapabilityDescriptor;
}

export function createCapabilityRegisteredEvent(
  capability: CapabilityDescriptor,
): CapabilityRegisteredEvent {
  return Object.freeze({ type: "capabilities.capability.registered", capability });
}

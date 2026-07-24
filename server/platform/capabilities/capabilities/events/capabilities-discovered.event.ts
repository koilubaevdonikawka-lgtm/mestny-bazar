import type { CapabilityDescriptor } from "@server/platform/capabilities/capabilities/models";

export interface CapabilitiesDiscoveredEvent {
  readonly type: "capabilities.discovered";
  readonly capabilities: readonly CapabilityDescriptor[];
}

export function createCapabilitiesDiscoveredEvent(
  capabilities: readonly CapabilityDescriptor[],
): CapabilitiesDiscoveredEvent {
  return Object.freeze({ type: "capabilities.discovered", capabilities });
}

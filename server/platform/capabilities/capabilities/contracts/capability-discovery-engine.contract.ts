import type { CapabilityDescriptor } from "@server/platform/capabilities/capabilities/models";

/** Contract for capability discovery from platform metadata. */
export interface ICapabilityDiscoveryEngine {
  discover(): readonly CapabilityDescriptor[];
}

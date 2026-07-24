import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** Future integration point for capability discovery. Not wired yet. */
export interface ICapabilityDiscoveryProvider {
  discover(): Promise<readonly Capability[]>;
}

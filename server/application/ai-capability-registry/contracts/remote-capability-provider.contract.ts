import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** Future integration point for external capability providers. Not wired yet. */
export interface IRemoteCapabilityProvider {
  fetchRemote(capabilityId: string): Promise<Capability | null>;
  pushRemote(capability: Capability): Promise<void>;
}

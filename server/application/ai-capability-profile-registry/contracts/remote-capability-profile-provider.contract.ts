import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Future integration point for external capability profile providers. Not wired yet. */
export interface IRemoteCapabilityProfileProvider {
  fetchRemote(capabilityProfileId: string): Promise<CapabilityProfile | null>;
  pushRemote(capabilityProfile: CapabilityProfile): Promise<void>;
}

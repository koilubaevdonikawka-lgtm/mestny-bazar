import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

/** Future integration point for capability profile synchronization. Not wired yet. */
export interface ICapabilityProfileSynchronizationProvider {
  synchronize(capabilityProfiles: readonly CapabilityProfile[]): Promise<void>;
}

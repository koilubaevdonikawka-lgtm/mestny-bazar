import type { TrustProfile } from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** Future integration point for trust profile synchronization. Not wired yet. */
export interface ITrustProfileSynchronizationProvider {
  synchronize(trustProfiles: readonly TrustProfile[]): Promise<void>;
}

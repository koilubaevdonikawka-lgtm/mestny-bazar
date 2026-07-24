import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Future integration point for network profile synchronization. Not wired yet. */
export interface INetworkProfileSynchronizationProvider {
  synchronize(networkProfiles: readonly NetworkProfile[]): Promise<void>;
}

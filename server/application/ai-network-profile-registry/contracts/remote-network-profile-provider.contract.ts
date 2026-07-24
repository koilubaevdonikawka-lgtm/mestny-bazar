import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Future integration point for external network profile providers. Not wired yet. */
export interface IRemoteNetworkProfileProvider {
  fetchRemote(networkProfileId: string): Promise<NetworkProfile | null>;
  pushRemote(networkProfile: NetworkProfile): Promise<void>;
}

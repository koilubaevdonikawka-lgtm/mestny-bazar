import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

export interface INetworkProfileSerializer {
  serialize(networkProfile: NetworkProfile): Promise<string>;
  deserialize(serialized: string): Promise<NetworkProfile>;
}

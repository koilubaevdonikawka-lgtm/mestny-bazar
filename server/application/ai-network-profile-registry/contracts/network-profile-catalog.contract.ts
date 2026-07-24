import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

export interface INetworkProfileCatalog {
  register(networkProfile: NetworkProfile): Promise<void>;
  remove(networkProfileId: string): Promise<void>;
  findById(networkProfileId: string): Promise<NetworkProfile | null>;
  findByName(name: string): Promise<NetworkProfile | null>;
  findByCategory(category: string): Promise<readonly NetworkProfile[]>;
  listAll(): Promise<readonly NetworkProfile[]>;
}

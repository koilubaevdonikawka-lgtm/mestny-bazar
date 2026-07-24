import type { NetworkProfile } from "@server/application/ai-network-profile-registry/models/network-profile.model";

export interface INetworkProfileRepository {
  save(networkProfile: NetworkProfile): Promise<void>;
  findById(networkProfileId: string): Promise<NetworkProfile | null>;
  findByName(name: string): Promise<NetworkProfile | null>;
  findByCategory(category: string): Promise<readonly NetworkProfile[]>;
  findAll(): Promise<readonly NetworkProfile[]>;
  delete(networkProfileId: string): Promise<boolean>;
}

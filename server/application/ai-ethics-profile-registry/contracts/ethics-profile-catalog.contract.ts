import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

export interface IEthicsProfileCatalog {
  register(ethicsProfile: EthicsProfile): Promise<void>;
  remove(ethicsProfileId: string): Promise<void>;
  findById(ethicsProfileId: string): Promise<EthicsProfile | null>;
  findByName(name: string): Promise<EthicsProfile | null>;
  findByCategory(category: string): Promise<readonly EthicsProfile[]>;
  listAll(): Promise<readonly EthicsProfile[]>;
}

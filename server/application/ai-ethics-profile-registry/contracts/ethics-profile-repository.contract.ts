import type { EthicsProfile } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

export interface IEthicsProfileRepository {
  save(ethicsProfile: EthicsProfile): Promise<void>;
  findById(ethicsProfileId: string): Promise<EthicsProfile | null>;
  findByName(name: string): Promise<EthicsProfile | null>;
  findByCategory(category: string): Promise<readonly EthicsProfile[]>;
  findAll(): Promise<readonly EthicsProfile[]>;
  delete(ethicsProfileId: string): Promise<boolean>;
}

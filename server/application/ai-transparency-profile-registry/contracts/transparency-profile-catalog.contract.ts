import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

export interface ITransparencyProfileCatalog {
  register(transparencyProfile: TransparencyProfile): Promise<void>;
  remove(transparencyProfileId: string): Promise<void>;
  findById(transparencyProfileId: string): Promise<TransparencyProfile | null>;
  findByName(name: string): Promise<TransparencyProfile | null>;
  findByCategory(category: string): Promise<readonly TransparencyProfile[]>;
  listAll(): Promise<readonly TransparencyProfile[]>;
}

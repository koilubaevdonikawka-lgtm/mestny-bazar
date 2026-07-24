import type { TransparencyProfile } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

export interface ITransparencyProfileRepository {
  save(transparencyProfile: TransparencyProfile): Promise<void>;
  findById(transparencyProfileId: string): Promise<TransparencyProfile | null>;
  findByName(name: string): Promise<TransparencyProfile | null>;
  findByCategory(category: string): Promise<readonly TransparencyProfile[]>;
  findAll(): Promise<readonly TransparencyProfile[]>;
  delete(transparencyProfileId: string): Promise<boolean>;
}

import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

export interface ISafetyProfileCatalog {
  register(safetyProfile: SafetyProfile): Promise<void>;
  remove(safetyProfileId: string): Promise<void>;
  findById(safetyProfileId: string): Promise<SafetyProfile | null>;
  findByName(name: string): Promise<SafetyProfile | null>;
  findByCategory(category: string): Promise<readonly SafetyProfile[]>;
  listAll(): Promise<readonly SafetyProfile[]>;
}

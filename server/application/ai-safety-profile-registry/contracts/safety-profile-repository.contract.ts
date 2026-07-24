import type { SafetyProfile } from "@server/application/ai-safety-profile-registry/models/safety-profile.model";

export interface ISafetyProfileRepository {
  save(safetyProfile: SafetyProfile): Promise<void>;
  findById(safetyProfileId: string): Promise<SafetyProfile | null>;
  findByName(name: string): Promise<SafetyProfile | null>;
  findByCategory(category: string): Promise<readonly SafetyProfile[]>;
  findAll(): Promise<readonly SafetyProfile[]>;
  delete(safetyProfileId: string): Promise<boolean>;
}

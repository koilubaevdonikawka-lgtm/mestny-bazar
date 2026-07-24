import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

export interface IFairnessProfileRepository {
  save(fairnessProfile: FairnessProfile): Promise<void>;
  findById(fairnessProfileId: string): Promise<FairnessProfile | null>;
  findByName(name: string): Promise<FairnessProfile | null>;
  findByCategory(category: string): Promise<readonly FairnessProfile[]>;
  findAll(): Promise<readonly FairnessProfile[]>;
  delete(fairnessProfileId: string): Promise<boolean>;
}

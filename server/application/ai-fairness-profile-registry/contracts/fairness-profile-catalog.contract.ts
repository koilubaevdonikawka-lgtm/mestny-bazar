import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

export interface IFairnessProfileCatalog {
  register(fairnessProfile: FairnessProfile): Promise<void>;
  remove(fairnessProfileId: string): Promise<void>;
  findById(fairnessProfileId: string): Promise<FairnessProfile | null>;
  findByName(name: string): Promise<FairnessProfile | null>;
  findByCategory(category: string): Promise<readonly FairnessProfile[]>;
  listAll(): Promise<readonly FairnessProfile[]>;
}

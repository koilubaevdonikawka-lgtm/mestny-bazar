import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

export interface IAccountabilityProfileCatalog {
  register(accountabilityProfile: AccountabilityProfile): Promise<void>;
  remove(accountabilityProfileId: string): Promise<void>;
  findById(accountabilityProfileId: string): Promise<AccountabilityProfile | null>;
  findByName(name: string): Promise<AccountabilityProfile | null>;
  findByCategory(category: string): Promise<readonly AccountabilityProfile[]>;
  listAll(): Promise<readonly AccountabilityProfile[]>;
}

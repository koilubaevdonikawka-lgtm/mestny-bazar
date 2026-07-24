import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

export interface IAccountabilityProfileRepository {
  save(accountabilityProfile: AccountabilityProfile): Promise<void>;
  findById(accountabilityProfileId: string): Promise<AccountabilityProfile | null>;
  findByName(name: string): Promise<AccountabilityProfile | null>;
  findByCategory(category: string): Promise<readonly AccountabilityProfile[]>;
  findAll(): Promise<readonly AccountabilityProfile[]>;
  delete(accountabilityProfileId: string): Promise<boolean>;
}

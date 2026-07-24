import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

export interface IAccountabilityProfileSerializer {
  serialize(accountabilityProfile: AccountabilityProfile): Promise<string>;
  deserialize(serialized: string): Promise<AccountabilityProfile>;
}

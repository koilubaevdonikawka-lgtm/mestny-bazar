import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Future integration point for external accountability profile providers. Not wired yet. */
export interface IRemoteAccountabilityProfileProvider {
  fetchRemote(accountabilityProfileId: string): Promise<AccountabilityProfile | null>;
  pushRemote(accountabilityProfile: AccountabilityProfile): Promise<void>;
}

import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Future integration point for accountability profile synchronization. Not wired yet. */
export interface IAccountabilityProfileSynchronizationProvider {
  synchronize(accountabilityProfiles: readonly AccountabilityProfile[]): Promise<void>;
}

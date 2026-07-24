import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Future integration point for profile synchronization. Not wired yet. */
export interface IProfileSynchronizationProvider {
  synchronize(profiles: readonly Profile[]): Promise<void>;
}

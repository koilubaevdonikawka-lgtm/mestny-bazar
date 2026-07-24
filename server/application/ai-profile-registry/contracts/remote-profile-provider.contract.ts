import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Future integration point for external profile providers. Not wired yet. */
export interface IRemoteProfileProvider {
  fetchRemote(profileId: string): Promise<Profile | null>;
  pushRemote(profile: Profile): Promise<void>;
}

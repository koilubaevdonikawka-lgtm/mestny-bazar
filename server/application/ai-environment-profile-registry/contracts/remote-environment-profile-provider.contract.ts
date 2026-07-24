import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Future integration point for external environment profile providers. Not wired yet. */
export interface IRemoteEnvironmentProfileProvider {
  fetchRemote(environmentProfileId: string): Promise<EnvironmentProfile | null>;
  pushRemote(environmentProfile: EnvironmentProfile): Promise<void>;
}

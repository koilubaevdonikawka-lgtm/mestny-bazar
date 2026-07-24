import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Future integration point for environment profile synchronization. Not wired yet. */
export interface IEnvironmentProfileSynchronizationProvider {
  synchronize(environmentProfiles: readonly EnvironmentProfile[]): Promise<void>;
}

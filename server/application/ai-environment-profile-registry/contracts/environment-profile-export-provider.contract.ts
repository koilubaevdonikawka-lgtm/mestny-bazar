import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Future integration point for environment profile export. Not wired yet. */
export interface IEnvironmentProfileExportProvider {
  exportTo(environmentProfiles: readonly EnvironmentProfile[]): Promise<string>;
}

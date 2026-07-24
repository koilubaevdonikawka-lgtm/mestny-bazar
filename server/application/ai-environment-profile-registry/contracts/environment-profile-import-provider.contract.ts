import type { EnvironmentProfile } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

/** Future integration point for environment profile import. Not wired yet. */
export interface IEnvironmentProfileImportProvider {
  importFrom(source: string): Promise<readonly EnvironmentProfile[]>;
}

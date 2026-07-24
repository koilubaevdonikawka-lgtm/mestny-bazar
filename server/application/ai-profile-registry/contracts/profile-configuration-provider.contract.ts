import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Future integration point for profile configuration management. Not wired yet. */
export interface IProfileConfigurationProvider {
  resolveConfiguration(profile: Profile): Promise<string>;
  validateConfiguration(configuration: string): Promise<boolean>;
}

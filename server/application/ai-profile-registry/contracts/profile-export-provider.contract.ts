import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Future integration point for profile export. Not wired yet. */
export interface IProfileExportProvider {
  exportTo(profiles: readonly Profile[]): Promise<string>;
}

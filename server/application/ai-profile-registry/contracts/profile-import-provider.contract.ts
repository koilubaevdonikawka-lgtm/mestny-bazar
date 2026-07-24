import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Future integration point for profile import. Not wired yet. */
export interface IProfileImportProvider {
  importFrom(source: string): Promise<readonly Profile[]>;
}

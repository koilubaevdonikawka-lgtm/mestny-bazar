import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Future integration point for resource profile import. Not wired yet. */
export interface IResourceProfileImportProvider {
  importProfiles(source: string): Promise<readonly ResourceProfile[]>;
}

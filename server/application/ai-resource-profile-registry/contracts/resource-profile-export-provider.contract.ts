import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Future integration point for resource profile export. Not wired yet. */
export interface IResourceProfileExportProvider {
  exportProfiles(resourceProfiles: readonly ResourceProfile[]): Promise<string>;
}

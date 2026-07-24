import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Future integration point for resource profile synchronization. Not wired yet. */
export interface IResourceProfileSynchronizationProvider {
  synchronize(resourceProfiles: readonly ResourceProfile[]): Promise<void>;
}

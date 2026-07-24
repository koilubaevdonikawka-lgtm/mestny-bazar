import type { ResourceProfile } from "@server/application/ai-resource-profile-registry/models/resource-profile.model";

/** Future integration point for external resource profile providers. Not wired yet. */
export interface IRemoteResourceProfileProvider {
  fetchRemote(resourceProfileId: string): Promise<ResourceProfile | null>;
  pushRemote(resourceProfile: ResourceProfile): Promise<void>;
}

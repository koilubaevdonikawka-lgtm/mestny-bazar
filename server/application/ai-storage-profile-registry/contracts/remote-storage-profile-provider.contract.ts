import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Future integration point for external storage profile providers. Not wired yet. */
export interface IRemoteStorageProfileProvider {
  fetchRemote(storageProfileId: string): Promise<StorageProfile | null>;
  pushRemote(storageProfile: StorageProfile): Promise<void>;
}

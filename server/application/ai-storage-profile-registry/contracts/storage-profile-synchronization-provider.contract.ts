import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Future integration point for storage profile synchronization. Not wired yet. */
export interface IStorageProfileSynchronizationProvider {
  synchronize(storageProfiles: readonly StorageProfile[]): Promise<void>;
}

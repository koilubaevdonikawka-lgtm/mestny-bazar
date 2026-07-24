import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Future integration point for storage profile export. Not wired yet. */
export interface IStorageProfileExportProvider {
  exportProfiles(storageProfiles: readonly StorageProfile[]): Promise<string>;
}

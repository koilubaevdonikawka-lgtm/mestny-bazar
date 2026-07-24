import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Future integration point for storage profile import. Not wired yet. */
export interface IStorageProfileImportProvider {
  importProfiles(source: string): Promise<readonly StorageProfile[]>;
}

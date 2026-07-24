import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

export interface IStorageProfileCatalog {
  register(storageProfile: StorageProfile): Promise<void>;
  remove(storageProfileId: string): Promise<void>;
  findById(storageProfileId: string): Promise<StorageProfile | null>;
  findByName(name: string): Promise<StorageProfile | null>;
  findByCategory(category: string): Promise<readonly StorageProfile[]>;
  listAll(): Promise<readonly StorageProfile[]>;
}

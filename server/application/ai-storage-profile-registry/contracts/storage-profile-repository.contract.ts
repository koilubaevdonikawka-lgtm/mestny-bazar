import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

export interface IStorageProfileRepository {
  save(storageProfile: StorageProfile): Promise<void>;
  findById(storageProfileId: string): Promise<StorageProfile | null>;
  findByName(name: string): Promise<StorageProfile | null>;
  findByCategory(category: string): Promise<readonly StorageProfile[]>;
  findAll(): Promise<readonly StorageProfile[]>;
  delete(storageProfileId: string): Promise<boolean>;
}

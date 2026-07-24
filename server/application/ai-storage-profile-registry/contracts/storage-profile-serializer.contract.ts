import type { StorageProfile } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

export interface IStorageProfileSerializer {
  serialize(storageProfile: StorageProfile): Promise<string>;
  deserialize(serialized: string): Promise<StorageProfile>;
}

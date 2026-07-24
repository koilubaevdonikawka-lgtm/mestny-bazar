import type { IStorageProfileSerializer } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-serializer.contract";
import {
  createStorageProfile,
  type StorageProfile,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** JSON-based storage profile serializer. */
export class JsonStorageProfileSerializer implements IStorageProfileSerializer {
  async serialize(storageProfile: StorageProfile): Promise<string> {
    return JSON.stringify(storageProfile);
  }

  async deserialize(serialized: string): Promise<StorageProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized storage profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<StorageProfile>;
    return createStorageProfile({
      storageProfileId: parsed.storageProfileId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

import type { StorageFileMetadata } from "@server/infrastructure/storage/files";
import type { StorageObjectMetadata } from "@server/infrastructure/storage/shared";

/** Maps low-level storage object metadata to infrastructure metadata. */
export class MetadataMapper {
  toFileMetadata(
    metadata: StorageObjectMetadata,
    publicUrl?: string,
  ): StorageFileMetadata {
    return Object.freeze({
      path: metadata.key,
      size: metadata.size,
      contentType: metadata.contentType,
      etag: metadata.etag,
      lastModified: metadata.lastModified,
      publicUrl,
      customMetadata: metadata.customMetadata,
    });
  }
}
